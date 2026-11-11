import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createMinnaUzMcpServer } from '../src/server.js';
import { createHttpApp } from '../src/transport/http.js';
import { MinnaUzApiClient } from '../src/services/api-client.js';

describe('HTTP Transport & Discovery Endpoints', () => {
  it('should serve RFC 9728 Protected Resource Metadata', async () => {
    const mockApiClient = {
      getCourses: vi.fn().mockResolvedValue([]),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);
    const app = await createHttpApp(server, mockApiClient);

    const res = await request(app).get('/.well-known/oauth-protected-resource');

    expect(res.status).toBe(200);
    expect(res.body.resource).toBe('https://mcp.minna.uz');
    expect(res.body.authorization_servers).toContain('https://api.minna.uz');
    expect(res.body.scopes_supported).toContain('read:profile');
    expect(res.body.bearer_methods_supported).toContain('header');
  });

  it('should return 200 OK on /health with system metrics', async () => {
    const mockApiClient = {
      getCourses: vi.fn().mockResolvedValue([]),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);
    const app = await createHttpApp(server, mockApiClient);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.server).toBe('minnauz-mcp-server');
    expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.body.memory).toBeDefined();
  });

  it('should return 200 OK on /livez', async () => {
    const mockApiClient = {} as unknown as MinnaUzApiClient;
    const { server } = createMinnaUzMcpServer(mockApiClient);
    const app = await createHttpApp(server, mockApiClient);

    const res = await request(app).get('/livez');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should return 200 OK on /readyz when API is connected', async () => {
    const mockApiClient = {
      getCourses: vi.fn().mockResolvedValue([]),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);
    const app = await createHttpApp(server, mockApiClient);

    const res = await request(app).get('/readyz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});

