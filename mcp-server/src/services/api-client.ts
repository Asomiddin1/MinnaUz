import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../config/env.js';
import type {
  CourseListItem,
  CourseDetail,
  LessonDetail,
  UserStatsDto,
  UserStudyPlanDto,
  UserSubscriptionDto,
  JlptTestSummary,
  JlptTestDetail,
  GlobalSearchResultItem,
  TranslateResultDto,
  KotobaItemDto,
  KanjiItemDto,
} from '../types/api.types.js';
import type { AuthenticatedUserClaims } from '../types/security.js';

export function resolveApiPath(path: string): string {
  let clean = path.startsWith('/') ? path.slice(1) : path;
  if (clean.startsWith('api/')) {
    clean = clean.slice(4);
  }
  return `/${clean}`;
}

export class MinnaUzApiClient {
  private readonly client: AxiosInstance;

  constructor(baseURL = env.MINNAUZ_API_URL, timeout = env.API_TIMEOUT_MS) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  private handleError(error: unknown, action: string): never {
    const isAxios =
      axios.isAxiosError(error) ||
      (error && typeof error === 'object' && ('isAxiosError' in error || 'response' in error || 'code' in error));

    if (isAxios) {
      const err = error as AxiosError<{ message?: string | string[]; statusCode?: number }>;
      const status = err.response?.status;
      const responseData = err.response?.data;
      const msg = Array.isArray(responseData?.message)
        ? responseData?.message.join(', ')
        : responseData?.message || err.message;

      if (status === 401) {
        throw new Error(`Authentication required for ${action}: ${msg}`);
      }
      if (status === 403) {
        throw new Error(`Access forbidden for ${action}: ${msg}`);
      }
      if (status === 404) {
        throw new Error(`Resource not found for ${action}`);
      }
      if (err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
        throw new Error(`MinnaUz API timed out while attempting to ${action}. Please try again.`);
      }
      throw new Error(`MinnaUz API error during ${action} (${status || 'network'}): ${msg}`);
    }
    throw new Error(`Unexpected error during ${action}: ${String(error)}`);
  }

  /**
   * Validates a Bearer token by querying /api/auth/me
   */
  async validateToken(token: string): Promise<AuthenticatedUserClaims> {
    try {
      const response = await this.client.get(resolveApiPath('/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        isPro: Boolean(data.isPro || data.subscription),
        coins: data.coins,
        streakDays: data.streakDays,
      };
    } catch (error) {
      this.handleError(error, 'token validation');
    }
  }

  // === USER ENDPOINTS ===
  async getMyProfile(token: string) {
    return this.validateToken(token);
  }

  async getMySubscription(token: string): Promise<UserSubscriptionDto> {
    try {
      const response = await this.client.get(resolveApiPath('/subscriptions/my-status'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return {
        tier: data.subscription?.tier || 'FREE',
        status: data.subscription?.status || 'INACTIVE',
        startDate: data.subscription?.startDate,
        endDate: data.subscription?.endDate,
        daysRemaining: data.daysRemaining ?? 0,
        planName: data.plan?.name,
        isPro: Boolean(data.isPro),
      };
    } catch (error) {
      this.handleError(error, 'fetching user subscription');
    }
  }

  async getMyStats(token?: string): Promise<UserStatsDto> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(resolveApiPath('/courses/user/stats'), { headers });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching learning statistics');
    }
  }

  async getMyStudyPlan(token: string): Promise<UserStudyPlanDto> {
    try {
      const response = await this.client.get(resolveApiPath('/courses/user/study-plan'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching user study plan');
    }
  }

  // === COURSES & LESSONS ===
  async getCourses(token?: string): Promise<CourseListItem[]> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(resolveApiPath('/courses'), { headers });
      const list = response.data;
      return list.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        level: item.level,
        coverImage: item.coverImage,
        modulesCount: item.modulesCount ?? item.modules?.length ?? 0,
        lessonsCount: item.lessonsCount ?? 0,
        ...(token ? { progressPercentage: item.progressPercentage ?? 0 } : {}),
      }));
    } catch (error) {
      this.handleError(error, 'fetching course list');
    }
  }

  async getCourseDetails(idOrSlug: string, token?: string): Promise<CourseDetail> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(resolveApiPath(`/courses/${idOrSlug}`), { headers });
      const c = response.data;
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        level: c.level,
        coverImage: c.coverImage,
        modules: (c.modules || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          order: m.order,
          lessons: (m.lessons || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            japaneseTitle: l.japaneseTitle,
            slug: l.slug,
            order: l.order,
            isFree: l.isFree,
            ...(token ? { isCompleted: Boolean(l.isCompleted) } : {}),
          })),
        })),
        totalLessons: c.totalLessons,
        ...(token ? { completedLessons: c.completedLessons } : {}),
      };
    } catch (error) {
      this.handleError(error, `fetching course details for ${idOrSlug}`);
    }
  }

  async getLessonDetails(courseId: string, lessonId: string, token?: string): Promise<LessonDetail> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(resolveApiPath(`/courses/${courseId}/lessons/${lessonId}`), { headers });
      return response.data;
    } catch (error) {
      this.handleError(error, `fetching lesson ${lessonId}`);
    }
  }

  // === VOCABULARY & KANJI ===
  async getAllVocab(token?: string): Promise<{ vocab: KotobaItemDto[]; totalCount: number; lockedWordCount?: number }> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(resolveApiPath('/courses/vocab/all'), { headers });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching vocabulary list');
    }
  }

  async getVocabStats(token: string): Promise<{ total: number; mastered: number; learning: number; notStarted: number }> {
    try {
      const response = await this.client.get(resolveApiPath('/courses/vocab/stats'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching vocabulary statistics');
    }
  }

  async getAllKanji(token?: string): Promise<{ kanji: KanjiItemDto[]; totalCount: number; lockedKanjiCount?: number }> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(resolveApiPath('/courses/kanji/all'), { headers });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching kanji list');
    }
  }

  async getKanjiStats(token: string): Promise<{ total: number; mastered: number; learning: number; notStarted: number }> {
    try {
      const response = await this.client.get(resolveApiPath('/courses/kanji/stats'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching kanji statistics');
    }
  }

  // === SEARCH & TRANSLATION ===
  async search(query: string): Promise<GlobalSearchResultItem> {
    try {
      const response = await this.client.get(resolveApiPath('/search'), {
        params: { q: query },
      });
      const data = response.data?.results || {};
      return {
        courses: data.courses || [],
        lessons: data.lessons || [],
        vocab: data.vocab || [],
        kanji: data.kanji || [],
        tests: data.tests || [],
      };
    } catch (error) {
      this.handleError(error, `searching for "${query}"`);
    }
  }

  async translate(text: string, direction: 'ja-uz' | 'uz-ja'): Promise<TranslateResultDto> {
    try {
      const response = await this.client.post(resolveApiPath('/ai/translate'), { text, direction });
      return response.data;
    } catch (error) {
      this.handleError(error, 'translating text');
    }
  }

  // === JLPT TESTS ===
  async getAvailableTests(level?: string, category?: string, token?: string): Promise<JlptTestSummary[]> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params: Record<string, string> = {};
      if (level) params.level = level;
      if (category) params.category = category;

      const response = await this.client.get(resolveApiPath('/tests'), { headers, params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching JLPT tests');
    }
  }

  async getTestDetails(slugOrId: string, token?: string): Promise<JlptTestDetail> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(resolveApiPath(`/tests/${slugOrId}`), { headers });
      return response.data;
    } catch (error) {
      this.handleError(error, `fetching test details for ${slugOrId}`);
    }
  }

  async getTestResults(resultId: string, token: string) {
    try {
      const response = await this.client.get(resolveApiPath(`/tests/results/${resultId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `fetching test results for ${resultId}`);
    }
  }

  async getTestHistory(limit = 10, token: string) {
    try {
      const response = await this.client.get(resolveApiPath('/tests/history'), {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching test history');
    }
  }
}
