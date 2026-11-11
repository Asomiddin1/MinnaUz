import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMinnaUzMcpServer } from '../server.js';
import { SecurityContext } from '../types/security.js';
import { securityContextStorage } from '../server.js';
import { env } from '../config/env.js';

async function runStdio() {
  const { server, apiClient } = createMinnaUzMcpServer();

  let userClaims;
  if (env.DEV_BEARER_TOKEN) {
    try {
      userClaims = await apiClient.validateToken(env.DEV_BEARER_TOKEN);
    } catch (e) {
      console.error('⚠️ Could not validate DEV_BEARER_TOKEN in STDIO mode:', e);
    }
  }

  const context = new SecurityContext({
    requestId: 'stdio-session',
    rawBearerToken: userClaims ? env.DEV_BEARER_TOKEN : undefined,
    user: userClaims,
    scopes: ['read:profile', 'read:courses', 'read:progress', 'read:tests'],
  });

  const transport = new StdioServerTransport();

  await securityContextStorage.run(context, async () => {
    await server.connect(transport);
  });

  console.error('MinnaUz MCP Server running on STDIO transport');
}

runStdio().catch((err) => {
  console.error('Fatal error in MinnaUz MCP STDIO transport:', err);
  process.exit(1);
});

