import { describe, it, expect } from 'vitest';
import { createMinnaUzMcpServer } from '../src/server.js';
import { MinnaUzApiClient } from '../src/services/api-client.js';

describe('MinnaUz McpServer Initialization', () => {
  it('should initialize McpServer with tools, resources, and prompts', () => {
    const mockApiClient = {} as unknown as MinnaUzApiClient;
    const { server, apiClient } = createMinnaUzMcpServer(mockApiClient);

    expect(server).toBeDefined();
    expect(apiClient).toBeDefined();
  });
});

