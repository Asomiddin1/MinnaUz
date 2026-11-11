import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from '../services/api-client.js';
import { SecurityContext } from '../types/security.js';

export function registerTestTools(
  server: McpServer,
  apiClient: MinnaUzApiClient,
  getContext: () => SecurityContext
) {
  // 1. get_available_tests (Tier 1 Public Read)
  server.tool(
    'get_available_tests',
    'Get a list of published JLPT mock exams and category drills (Grammar, Vocabulary, Reading, Listening) available on MinnaUz.',
    {
      level: z
        .enum(['N5', 'N4', 'N3', 'N2', 'N1'])
        .optional()
        .describe('Filter by JLPT level (N5 to N1)'),
      category: z
        .enum(['MOCK_EXAM', 'VOCABULARY_KANJI', 'GRAMMAR_READING', 'LISTENING'])
        .optional()
        .describe('Filter by test category'),
    },
    async ({ level, category }) => {
      const context: SecurityContext = getContext();
      const tests = await apiClient.getAvailableTests(level, category, context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tests, null, 2),
          },
        ],
      };
    }
  );

  // 2. get_test_details (Tier 1 Public Read)
  server.tool(
    'get_test_details',
    'Get the structure, sections, and questions for a specific JLPT test or mock exam. Correct answers and explanations are sanitized by the backend to prevent cheating.',
    {
      slugOrId: z.string().describe('The test slug (e.g. "jlpt-n5-mock-exam-1") or test UUID'),
    },
    async ({ slugOrId }) => {
      const context: SecurityContext = getContext();
      const details = await apiClient.getTestDetails(slugOrId, context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(details, null, 2),
          },
        ],
      };
    }
  );

  // 3. get_test_results (Tier 2 Authenticated Read)
  server.tool(
    'get_test_results',
    'Get detailed results, scoring analysis, correct answers, and explanations for a previously completed test result.',
    {
      resultId: z.string().describe('The unique result UUID returned when the test was completed'),
    },
    async ({ resultId }) => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_test_results');
      context.assertScope('read:tests', 'get_test_results');

      const result = await apiClient.getTestResults(resultId, context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // 4. get_test_history (Tier 2 Authenticated Read)
  server.tool(
    'get_test_history',
    'Get the history of JLPT tests and mock exams completed by the authenticated student, including scores, pass/fail status, and completion dates.',
    {
      limit: z.number().int().min(1).max(50).default(10).describe('Maximum number of test history records to return'),
    },
    async ({ limit }) => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_test_history');
      context.assertScope('read:tests', 'get_test_history');

      const history = await apiClient.getTestHistory(limit, context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(history, null, 2),
          },
        ],
      };
    }
  );
}
