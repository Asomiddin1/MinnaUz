import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from '../services/api-client.js';
import { SecurityContext } from '../types/security.js';
import { registerUserTools } from './user.tools.js';
import { registerCourseTools } from './courses.tools.js';
import { registerLearningTools } from './learning.tools.js';
import { registerTestTools } from './tests.tools.js';

export function registerAllTools(
  server: McpServer,
  apiClient: MinnaUzApiClient,
  getContext: () => SecurityContext
) {
  registerUserTools(server, apiClient, getContext);
  registerCourseTools(server, apiClient, getContext);
  registerLearningTools(server, apiClient, getContext);
  registerTestTools(server, apiClient, getContext);
}

