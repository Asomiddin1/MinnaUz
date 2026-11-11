import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from '../services/api-client.js';
import { SecurityContext } from '../types/security.js';

export function registerUserTools(
  server: McpServer,
  apiClient: MinnaUzApiClient,
  getContext: () => SecurityContext
) {
  // 1. get_my_profile (Tier 2 Authenticated Read)
  server.tool(
    'get_my_profile',
    'Get the authenticated user profile on MinnaUz (id, email, fullName, role, streak, coins, and Pro status). Requires an authenticated MinnaUz user session.',
    {},
    async () => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_my_profile');
      context.assertScope('read:profile', 'get_my_profile');

      const profile = await apiClient.getMyProfile(context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    }
  );

  // 2. get_my_subscription (Tier 2 Authenticated Read)
  server.tool(
    'get_my_subscription',
    'Get the current subscription tier, status, days remaining, and plan details for the authenticated user.',
    {},
    async () => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_my_subscription');
      context.assertScope('read:profile', 'get_my_subscription');

      const sub = await apiClient.getMySubscription(context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(sub, null, 2),
          },
        ],
      };
    }
  );

  // 3. get_my_learning_statistics (Tier 2 Authenticated Read)
  server.tool(
    'get_my_learning_statistics',
    'Get personal learning statistics for the student (streak days, study time in minutes, learned vocabulary count, mastered kanji count, completed lessons).',
    {},
    async () => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_my_learning_statistics');
      context.assertScope('read:progress', 'get_my_learning_statistics');

      const stats = await apiClient.getMyStats(context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    }
  );

  // 4. get_my_study_plan (Tier 2 Authenticated Read)
  server.tool(
    'get_my_study_plan',
    'Get the personalized study plan configured by the user (target JLPT level, daily minutes target, weekly goal hours, target timeline).',
    {},
    async () => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_my_study_plan');
      context.assertScope('read:profile', 'get_my_study_plan');

      const plan = await apiClient.getMyStudyPlan(context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(plan, null, 2),
          },
        ],
      };
    }
  );
}
