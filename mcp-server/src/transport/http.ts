import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { env } from '../config/env.js';
import { MinnaUzApiClient } from '../services/api-client.js';
import { SecurityContext, AuthenticatedUserClaims, McpSecurityError } from '../types/security.js';
import { securityContextStorage } from '../server.js';

export async function createHttpApp(server: McpServer, apiClient: MinnaUzApiClient) {
  const app = express();

  // Basic Middleware
  app.use(express.json({ limit: '2mb' }));
  app.use(
    cors({
      origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-minnauz-token', 'Accept'],
      exposedHeaders: ['WWW-Authenticate'],
    })
  );

  // Initialize Streamable HTTP Transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode for remote HTTP connections
  });

  await server.connect(transport);

  // 1. RFC 9728: OAuth Protected Resource Metadata
  app.get('/.well-known/oauth-protected-resource', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      resource: env.MCP_RESOURCE_URL,
      authorization_servers: [env.MINNAUZ_AUTH_SERVER_URL],
      scopes_supported: ['read:profile', 'read:courses', 'read:progress', 'read:tests'],
      bearer_methods_supported: ['header'],
      resource_documentation: 'https://minna.uz/docs/mcp',
    });
  });

  // 2. Health & Monitoring Probes
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      server: 'minnauz-mcp-server',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    });
  });

  app.get('/livez', (_req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  app.get('/readyz', async (_req: Request, res: Response) => {
    try {
      // Shallow probe to check if MinnaUz API responds
      await apiClient.getCourses();
      res.status(200).json({ status: 'ready', downstreamApi: 'connected' });
    } catch {
      res.status(503).json({ status: 'unavailable', downstreamApi: 'unreachable' });
    }
  });

  // 3. MCP Streamable HTTP Protocol Route (/mcp)
  app.all('/mcp', async (req: Request, res: Response, next: NextFunction) => {
    const requestId = randomUUID();

    // Extract Bearer token
    let rawToken: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      rawToken = authHeader.substring(7).trim();
    } else if (typeof req.headers['x-minnauz-token'] === 'string') {
      rawToken = req.headers['x-minnauz-token'].trim();
    } else if (typeof req.query.token === 'string') {
      rawToken = req.query.token.trim();
    } else if (env.DEV_BEARER_TOKEN && env.NODE_ENV !== 'production') {
      rawToken = env.DEV_BEARER_TOKEN;
    }

    let userClaims: AuthenticatedUserClaims | undefined;
    if (rawToken) {
      try {
        userClaims = await apiClient.validateToken(rawToken);
      } catch {
        // Invalid or expired token: don't crash, let unauthenticated context be created
        // If a tool strictly requires auth, it will throw McpSecurityError
      }
    }

    const context = new SecurityContext({
      requestId,
      rawBearerToken: userClaims ? rawToken : undefined,
      user: userClaims,
      scopes: userClaims ? ['read:profile', 'read:courses', 'read:progress', 'read:tests'] : [],
    });

    try {
      await securityContextStorage.run(context, async () => {
        await transport.handleRequest(req, res, req.body);
      });
    } catch (err: unknown) {
      if (err instanceof McpSecurityError) {
        res.setHeader(
          'WWW-Authenticate',
          `Bearer error="unauthorized", resource="${env.MCP_RESOURCE_URL}", authorization_uri="${env.MINNAUZ_AUTH_SERVER_URL}/api/oauth/authorize", scope="read:profile read:courses"`
        );
        res.status(401).json({
          jsonrpc: '2.0',
          error: {
            code: err.code,
            message: err.message,
            data: err.data,
          },
          id: null,
        });
        return;
      }
      next(err);
    }
  });

  return app;
}

