import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from '../services/api-client.js';
import { registerJlptResources } from './jlpt.resources.js';
import { registerPlatformResources } from './platform.resources.js';

export function registerAllResources(server: McpServer, apiClient: MinnaUzApiClient) {
  registerJlptResources(server);
  registerPlatformResources(server, apiClient);
}

