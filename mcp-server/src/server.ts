import { AsyncLocalStorage } from 'node:async_hooks';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from './services/api-client.js';
import { SecurityContext } from './types/security.js';
import { registerAllTools } from './tools/index.js';
import { registerAllResources } from './resources/index.js';
import { registerAllPrompts } from './prompts/index.js';

export const securityContextStorage = new AsyncLocalStorage<SecurityContext>();

export function getSecurityContext(): SecurityContext {
  return (
    securityContextStorage.getStore() ??
    new SecurityContext({
      requestId: 'internal',
    })
  );
}

export function createMinnaUzMcpServer(customClient?: MinnaUzApiClient) {
  const apiClient = customClient ?? new MinnaUzApiClient();

  const server = new McpServer(
    {
      name: 'minnauz-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Register all tools, resources, and prompts
  registerAllTools(server, apiClient, getSecurityContext);
  registerAllResources(server, apiClient);
  registerAllPrompts(server);

  return { server, apiClient };
}

