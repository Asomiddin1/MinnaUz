import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from '../services/api-client.js';
import { SecurityContext } from '../types/security.js';

// Simple in-memory translation cache to protect backend Groq LLM inference costs
const translationCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Simple rate limiter tracking requests per minute per IP / client
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkTranslationRateLimit(key: string, limit = 15): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

export function registerLearningTools(
  server: McpServer,
  apiClient: MinnaUzApiClient,
  getContext: () => SecurityContext
) {
  // 1. get_vocabulary (Tier 1 Public / Tier 2 Authenticated for Pro words)
  server.tool(
    'get_vocabulary',
    'Get vocabulary words (Kotoba) across MinnaUz courses with Japanese kanji/kana, furigana, romaji, Uzbek translations, parts of speech, and sample sentences.',
    {},
    async () => {
      const context: SecurityContext = getContext();
      const result = await apiClient.getAllVocab(context.rawBearerToken);
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

  // 2. get_vocabulary_statistics (Tier 2 Authenticated Read)
  server.tool(
    'get_vocabulary_statistics',
    'Get counts of mastered, learning, and unstarted vocabulary flashcards for the authenticated student.',
    {},
    async () => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_vocabulary_statistics');
      context.assertScope('read:progress', 'get_vocabulary_statistics');

      const stats = await apiClient.getVocabStats(context.rawBearerToken);
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

  // 3. get_kanji_list (Tier 1 Public / Tier 2 Authenticated for Pro kanji)
  server.tool(
    'get_kanji_list',
    'Get Japanese Kanji characters taught in MinnaUz courses with onyomi readings, kunyomi readings, stroke counts, and Uzbek meanings.',
    {},
    async () => {
      const context: SecurityContext = getContext();
      const result = await apiClient.getAllKanji(context.rawBearerToken);
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

  // 4. get_kanji_statistics (Tier 2 Authenticated Read)
  server.tool(
    'get_kanji_statistics',
    'Get student flashcard statistics for Japanese Kanji (mastered vs learning counts).',
    {},
    async () => {
      const context: SecurityContext = getContext();
      context.assertAuthenticated('get_kanji_statistics');
      context.assertScope('read:progress', 'get_kanji_statistics');

      const stats = await apiClient.getKanjiStats(context.rawBearerToken);
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

  // 5. search_learning_materials (Tier 1 Public Read)
  server.tool(
    'search_learning_materials',
    'Search across all published MinnaUz learning materials (courses, lessons, vocabulary words, kanji characters, and JLPT mock tests) by keyword in Uzbek, Japanese (kanji/kana), or romaji.',
    {
      query: z.string().min(1).describe('The search query keyword (e.g. "nihon", "talaba", "日")'),
    },
    async ({ query }) => {
      const results = await apiClient.search(query);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );

  // 6. translate_japanese_uzbek (Tier 1 Public Utility with Cost & Abuse Protection)
  server.tool(
    'translate_japanese_uzbek',
    'Translate text between Japanese and Uzbek using MinnaUz educational AI. Maximum 500 characters per request.',
    {
      text: z
        .string()
        .min(1)
        .max(500)
        .describe('The text to translate (maximum 500 characters)'),
      direction: z
        .enum(['ja-uz', 'uz-ja'])
        .describe('Translation direction: "ja-uz" (Japanese to Uzbek) or "uz-ja" (Uzbek to Japanese)'),
    },
    async ({ text, direction }) => {
      const context: SecurityContext = getContext();
      const rateLimitKey = context.user?.id || context.requestId || 'anon';
      const allowedLimit = context.isAuthenticated ? 15 : 5;

      if (!checkTranslationRateLimit(rateLimitKey, allowedLimit)) {
        throw new Error(
          `Translation rate limit exceeded. Max ${allowedLimit} requests per minute. Please wait before translating again.`
        );
      }

      // Check cache
      const cacheKey = `${direction}:${text.trim()}`;
      const cached = translationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  translatedText: cached.result,
                  originalText: text,
                  direction,
                  fromCache: true,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const result = await apiClient.translate(text, direction);

      // Save to cache
      translationCache.set(cacheKey, {
        result: result.translatedText,
        timestamp: Date.now(),
      });

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
}
