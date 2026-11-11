import { describe, it, expect, vi } from 'vitest';
import { SecurityContext, McpSecurityError } from '../src/types/security.js';
import { securityContextStorage, createMinnaUzMcpServer } from '../src/server.js';
import { MinnaUzApiClient } from '../src/services/api-client.js';

describe('Tool Security & Execution', () => {
  it('should reject get_my_profile when caller is unauthenticated', async () => {
    const mockApiClient = {
      getMyProfile: vi.fn(),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);

    const anonymousContext = new SecurityContext({
      requestId: 'test-req-1',
      rawBearerToken: undefined,
      user: undefined,
    });

    await securityContextStorage.run(anonymousContext, async () => {
      // Find the tool callback
      const toolHandler = (server as any)._registeredTools['get_my_profile'];
      expect(toolHandler).toBeDefined();

      await expect(toolHandler.handler({})).rejects.toThrow(McpSecurityError);
      await expect(toolHandler.handler({})).rejects.toThrow(
        "Tool 'get_my_profile' requires user authentication. Connect your MinnaUz account via OAuth."
      );
    });
  });

  it('should reject get_my_learning_statistics when scope is missing', async () => {
    const mockApiClient = {
      getMyStats: vi.fn(),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);

    const limitedContext = new SecurityContext({
      requestId: 'test-req-2',
      rawBearerToken: 'valid-token',
      user: {
        id: 'u-1',
        email: 'u1@minna.uz',
        role: 'USER',
        isPro: false,
      },
      scopes: ['read:profile'], // missing 'read:progress'
    });

    await securityContextStorage.run(limitedContext, async () => {
      const toolHandler = (server as any)._registeredTools['get_my_learning_statistics'];
      expect(toolHandler).toBeDefined();

      await expect(toolHandler.handler({})).rejects.toThrow(
        "Tool 'get_my_learning_statistics' requires OAuth scope 'read:progress'."
      );
    });
  });

  it('should allow get_courses for anonymous caller without user progress', async () => {
    const mockCourses = [
      {
        id: 'c-1',
        title: 'N5 Boshlangich',
        slug: 'n5-boshlangich',
        level: 'N5',
        modulesCount: 5,
        lessonsCount: 25,
      },
    ];

    const mockApiClient = {
      getCourses: vi.fn().mockResolvedValue(mockCourses),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);

    const anonymousContext = new SecurityContext({
      requestId: 'test-req-3',
    });

    await securityContextStorage.run(anonymousContext, async () => {
      const toolHandler = (server as any)._registeredTools['get_courses'];
      const response = await toolHandler.handler({});

      expect(response.content[0].type).toBe('text');
      const parsed = JSON.parse(response.content[0].text);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('N5 Boshlangich');
      expect(parsed[0].progressPercentage).toBeUndefined(); // anonymous
    });
  });

  it('should reject translate_japanese_uzbek if text exceeds 500 characters', async () => {
    const mockApiClient = {
      translate: vi.fn(),
    } as unknown as MinnaUzApiClient;

    const { server } = createMinnaUzMcpServer(mockApiClient);
    const context = new SecurityContext({ requestId: 'test-req-4' });

    await securityContextStorage.run(context, async () => {
      const toolHandler = (server as any)._registeredTools['translate_japanese_uzbek'];
      const longText = 'a'.repeat(501);

      // Zod validation should reject text > 500 chars
      await expect(
        toolHandler.handler({ text: longText, direction: 'ja-uz' })
      ).rejects.toThrow();
    });
  });
});

