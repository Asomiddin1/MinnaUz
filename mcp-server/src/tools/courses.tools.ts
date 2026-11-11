import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from '../services/api-client.js';
import { SecurityContext } from '../types/security.js';

export function registerCourseTools(
  server: McpServer,
  apiClient: MinnaUzApiClient,
  getContext: () => SecurityContext
) {
  // 1. get_courses (Tier 1 Public Read / Personalized if authenticated)
  server.tool(
    'get_courses',
    'Get the catalog of available Japanese courses on MinnaUz (N5 to N1 levels, descriptions, module and lesson counts). If the user is authenticated, also includes personal completion percentage.',
    {},
    async () => {
      const context = getContext();
      const courses = await apiClient.getCourses(context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(courses, null, 2),
          },
        ],
      };
    }
  );

  // 2. get_course_details (Tier 1 Public Read / Personalized if authenticated)
  server.tool(
    'get_course_details',
    'Get full details of a specific course, including its modules, lessons outline, and roadmaps. Does not expose user progress unless authenticated.',
    {
      idOrSlug: z.string().describe('The unique ID or URL slug of the course (e.g. "n5-boshlangich", "n4-davomi")'),
    },
    async ({ idOrSlug }) => {
      const context = getContext();
      const details = await apiClient.getCourseDetails(idOrSlug, context.rawBearerToken);
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

  // 3. get_lesson_details (Tier 1 Public Read / Pro gated)
  server.tool(
    'get_lesson_details',
    'Get detailed educational content for a specific lesson, including Kotoba (vocabulary), Bunpou (grammar), Kanji, and Renshuu exercises. Free lessons are accessible to all; Pro lessons require an active subscription.',
    {
      courseId: z.string().describe('The course ID or course slug'),
      lessonId: z.string().describe('The specific lesson ID'),
    },
    async ({ courseId, lessonId }) => {
      const context = getContext();
      const lesson = await apiClient.getLessonDetails(courseId, lessonId, context.rawBearerToken);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(lesson, null, 2),
          },
        ],
      };
    }
  );
}

