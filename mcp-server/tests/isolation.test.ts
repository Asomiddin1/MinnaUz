import { describe, it, expect, vi } from 'vitest';
import { SecurityContext } from '../src/types/security.js';
import { securityContextStorage, createMinnaUzMcpServer } from '../src/server.js';
import { MinnaUzApiClient } from '../src/services/api-client.js';

describe('Cross-User Request & Tenant Isolation', () => {
  it('should guarantee strict isolation across concurrent interleaved requests', async () => {
    const mockApiClient = {
      getMyProfile: vi.fn().mockImplementation(async (token: string) => {
        // Artificial micro-delay to simulate async I/O race conditions
        await new Promise((r) => setTimeout(r, Math.random() * 20));
        if (token === 'token-alice') {
          return { id: 'user-alice', email: 'alice@minna.uz', role: 'USER', isPro: true };
        }
        if (token === 'token-bob') {
          return { id: 'user-bob', email: 'bob@minna.uz', role: 'USER', isPro: false };
        }
        throw new Error('Unauthorized');
      }),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);
    const toolHandler = (server as any)._registeredTools['get_my_profile'];

    const aliceContext = new SecurityContext({
      requestId: 'req-alice',
      rawBearerToken: 'token-alice',
      user: { id: 'user-alice', email: 'alice@minna.uz', role: 'USER', isPro: true },
      scopes: ['read:profile'],
    });

    const bobContext = new SecurityContext({
      requestId: 'req-bob',
      rawBearerToken: 'token-bob',
      user: { id: 'user-bob', email: 'bob@minna.uz', role: 'USER', isPro: false },
      scopes: ['read:profile'],
    });

    const anonContext = new SecurityContext({
      requestId: 'req-anon',
    });

    // Run 30 interleaved concurrent executions
    const tasks = Array.from({ length: 30 }, (_, index) => {
      const mode = index % 3;
      if (mode === 0) {
        return securityContextStorage.run(aliceContext, async () => {
          const res = await toolHandler.handler({});
          const data = JSON.parse(res.content[0].text);
          expect(data.id).toBe('user-alice');
          expect(data.email).toBe('alice@minna.uz');
        });
      } else if (mode === 1) {
        return securityContextStorage.run(bobContext, async () => {
          const res = await toolHandler.handler({});
          const data = JSON.parse(res.content[0].text);
          expect(data.id).toBe('user-bob');
          expect(data.email).toBe('bob@minna.uz');
        });
      } else {
        return securityContextStorage.run(anonContext, async () => {
          await expect(toolHandler.handler({})).rejects.toThrow();
        });
      }
    });

    await Promise.all(tasks);
  });
});

