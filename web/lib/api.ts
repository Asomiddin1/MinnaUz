function resolveApiUrl(): string {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');
  const base = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    // If accessing via LAN IP (e.g. 192.168.x.x on mobile), replace localhost with device hostname
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      try {
        const parsed = new URL(base);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          parsed.hostname = currentHost;
          return parsed.toString().replace(/\/+$/, '');
        }
      } catch {}
    }
  }

  return base;
}

export const API_URL = resolveApiUrl();

// Statik fayllar (masalan, yuklangan videolar) uchun /api siz asosiy manzil
export const API_ORIGIN = API_URL.replace(/\/api$/, '');

export function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  // Backend upload path (e.g. /uploads/... or uploads/...)
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${API_ORIGIN}${cleanPath}`;
  }

  // Next.js local public static assets (e.g. /planbanner_bg.png, /auth_bg.jpg, /logo.png)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `${API_ORIGIN}/${trimmed}`;
}

export type StorageCategory =
  | 'videos'
  | 'audio'
  | 'images'
  | 'avatars'
  | 'documents'
  | 'materials';

export interface PresignedUrlResponse {
  success: boolean;
  fileId: string;
  uploadUrl: string;
  objectKey: string;
  isPublic: boolean;
  publicUrl?: string | null;
  expiresIn: number;
}

export interface CompleteUploadResponse {
  success: boolean;
  fileId: string;
  objectKey: string;
  url?: string | null;
  isPublic: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  googleAvatarUrl?: string;
  avatarFrame?: string | null;
  coins?: number;
  role: 'USER' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified?: boolean;
  isPro?: boolean;
}

export interface AdminUserItem extends User {
  createdAt: string;
  updatedAt: string;
  activeDevicesCount: number;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserStats {
  totalUsers: number;
  verifiedUsers: number;
  totalAdmins: number;
  superAdmins: number;
  admins: number;
  teachers: number;
  standardUsers: number;
  activeSessions: number;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  deviceName?: string;
  os?: string;
  browser?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  device: DeviceSession;
}

export interface ActiveCourseStats {
  id: string;
  slug: string;
  title: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  nextLesson?: {
    id: string;
    title: string;
    japaneseTitle?: string;
    order: number;
    summary?: string;
    category?: string;
    progressPercent: number;
  } | null;
}

export interface WeeklyActivityDay {
  day: string; // 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'
  date: string;
  minutes: number;
  height: string;
  active: boolean;
}

export interface UserStudyTimeStats {
  totalMinutes: number;
  totalHours: number;
  totalMinutesRemainder: number;
  todayMinutes: number;
  todayHours: number;
  todayMinutesRemainder: number;
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  weeklyProgressPercent: number;
  weeklyActivity: WeeklyActivityDay[];
}

export interface UserStudyPlan {
  targetLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  weeklyGoalHours: number;
  dailyMinutes: number;
  targetMonths: number;
  isConfigured: boolean;
}

export interface BannerItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
  tagIcon: string;
  image: string;
  btnText: string;
  btnUrl?: string | null;
  btnIcon: string;
  actionType: 'LINK' | 'PLAN_MODAL' | 'NOTIFICATION_DETAIL';
  notificationId?: string | null;
  order: number;
  isActive: boolean;
  isDismissible: boolean;
  targetAudience: 'ALL' | 'USER' | 'TEACHER';
  notification?: NotificationItem | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  content?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  actionUrl?: string | null;
  actionText?: string | null;
  audience: 'ALL' | 'USER' | 'TEACHER' | 'INDIVIDUAL';
  type: 'INFO' | 'ANNOUNCEMENT' | 'SYSTEM' | 'UPDATE' | 'PROMO';
  isPublished?: boolean;
  createdAt: string;
  isRead?: boolean;
  readAt?: string | null;
  readCount?: number;
  hasBanner?: boolean;
}

export interface CreateBannerDto {
  title: string;
  desc: string;
  tag?: string;
  tagIcon?: string;
  image?: string;
  btnText?: string;
  btnUrl?: string;
  btnIcon?: string;
  actionType?: 'LINK' | 'PLAN_MODAL' | 'NOTIFICATION_DETAIL';
  notificationId?: string;
  order?: number;
  isActive?: boolean;
  isDismissible?: boolean;
  targetAudience?: 'ALL' | 'USER' | 'TEACHER';
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  actionUrl?: string;
  actionText?: string;
  audience?: 'ALL' | 'USER' | 'TEACHER' | 'INDIVIDUAL';
  targetUserId?: string;
  type?: 'INFO' | 'ANNOUNCEMENT' | 'SYSTEM' | 'UPDATE' | 'PROMO';
  isPublished?: boolean;
  createBanner?: boolean;
  bannerTag?: string;
  bannerImage?: string;
}

export interface UserDashboardStats {
  streakDays: number;
  wordsLearned: number;
  completedLessons: number;
  totalLessons: number;
  n5ProgressPercent: number;
  recentLessons: {
    id: string;
    title: string;
    japaneseTitle?: string;
    courseTitle: string;
    courseSlug: string;
    isCompleted: boolean;
    quizScore?: number | null;
  }[];
  activeCourse?: ActiveCourseStats | null;
  studyTime?: UserStudyTimeStats;
  studyPlan?: UserStudyPlan;
  activeDates?: number[];
}

// === COURSES TYPES ===

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  coverImage?: string;
  author?: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
  };
  totalLessons: number;
  totalModules: number;
  progress: number; // 0 - 100%
}

export interface CourseLessonSummary {
  id: string;
  title: string;
  japaneseTitle?: string;
  slug?: string;
  order: number;
  summary?: string;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED' | 'AVAILABLE';
  isCompleted: boolean;
  isLocked?: boolean;
  lockReason?: string;
  isFree?: boolean;
  isProRequired?: boolean;
  quizScore?: number | null;
  completedSections: string[];
  counts: {
    kotobaItems: number;
    bunpouItems: number;
    kanjiItems: number;
    renshuuItems: number;
  };
}

export interface CourseModuleDetails {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLessonSummary[];
}

export interface CourseDetailsResponse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';
  coverImage?: string;
  author?: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
  };
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  modules: CourseModuleDetails[];
}

export type FlashcardStatus = 'LEARNING' | 'MASTERED';

export interface UserKotobaWordItem {
  id: string;
  word: string;
  furigana: string;
  romaji: string;
  meaningUz: string;
  meaningRu: string;
  meaningEn: string;
  partOfSpeech: string;
  audioUrl?: string | null;
  sampleSentence?: string | null;
  sampleSentenceUz?: string | null;
  order: number;
  lessonId: string;
  lessonTitle: string;
  lessonJapaneseTitle?: string | null;
  lessonOrder: number;
  courseId: string;
  courseTitle: string;
  courseLevel: string;
  flashcardStatus: FlashcardStatus | null;
  reviewCount: number;
}

export interface UserVocabResponse {
  words: UserKotobaWordItem[];
  totalCount: number;
  lockedWordCount: number;
  isPro: boolean;
}

export interface VocabStatsResponse {
  totalLearning: number;
  totalMastered: number;
  totalSaved: number;
}

export interface UserKanjiItem {
  id: string;
  character: string;
  onyomi: string;
  kunyomi: string;
  meaningUz: string;
  meaningRu: string;
  strokeCount: number;
  strokeOrderData?: string | null;
  radical: string;
  examples: { word: string; reading: string; meaning: string }[];
  order: number;
  lessonId: string;
  lessonTitle: string;
  lessonJapaneseTitle?: string | null;
  lessonOrder: number;
  courseId: string;
  courseTitle: string;
  courseLevel: string;
  flashcardStatus: FlashcardStatus | null;
  reviewCount: number;
}

export interface UserKanjiResponse {
  kanji: UserKanjiItem[];
  totalCount: number;
  lockedKanjiCount: number;
  isPro: boolean;
}

export interface KanjiStatsResponse {
  totalLearning: number;
  totalMastered: number;
  totalSaved: number;
}

export interface GlobalSearchResult {
  query: string;
  totalCount: number;
  results: {
    courses: {
      id: string;
      title: string;
      slug: string;
      level: string;
      description?: string | null;
      coverImage?: string | null;
    }[];
    lessons: {
      id: string;
      title: string;
      japaneseTitle?: string | null;
      order: number;
      courseId: string;
      courseSlug: string;
      courseTitle: string;
      courseLevel: string;
      isFree: boolean;
    }[];
    vocab: {
      id: string;
      word: string;
      furigana?: string | null;
      romaji?: string | null;
      meaningUz: string;
      partOfSpeech?: string | null;
      courseLevel: string;
      lessonOrder: number;
    }[];
    kanji: {
      id: string;
      character: string;
      onyomi?: string | null;
      kunyomi?: string | null;
      meaningUz: string;
      strokeCount?: number | null;
      courseLevel: string;
    }[];
    tests: {
      id: string;
      title: string;
      slug: string;
      level: string;
      category: string;
      isPremium: boolean;
      durationMinutes: number;
    }[];
    pages: {
      id: string;
      title: string;
      subtitle: string;
      icon: string;
      url: string;
    }[];
  };
}

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type JlptCategory = 'MOCK_EXAM' | 'VOCABULARY_KANJI' | 'GRAMMAR_READING' | 'LISTENING';

export interface JlptTestItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  level: JlptLevel;
  category: JlptCategory;
  durationMinutes: number;
  passingScore: number;
  totalScore: number;
  audioUrl?: string | null;
  order: number;
  isPublished: boolean;
  isPremium: boolean;
  questionCount: number;
  latestResult?: {
    id: string;
    score: number;
    percentage: number;
    isPassed: boolean;
    timeSpentSeconds: number;
    completedAt: string;
  } | null;
}

export interface JlptQuestionItem {
  id: string;
  section: string;
  mondaiTitle?: string | null;
  questionNumber: number;
  questionText: string;
  contextText?: string | null;
  imageUrl?: string | null;
  options: string[];
  points: number;
  order: number;
}

export interface JlptTestDetail extends Omit<JlptTestItem, 'questionCount'> {
  questions: JlptQuestionItem[];
}

export interface JlptTestStats {
  totalTestsTaken: number;
  passedCount: number;
  avgPercentage: number;
  totalQuestionsAnswered: number;
}

export interface EvaluatedAnswerItem {
  questionId: string;
  section: string;
  questionNumber: number;
  questionText: string;
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  explanation?: string | null;
  isCorrect: boolean;
  points: number;
}

export interface TestSubmitResponse {
  resultId: string;
  testTitle: string;
  score: number;
  totalScore: number;
  passingScore?: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  answers: EvaluatedAnswerItem[];
}

export interface JlptUserTestHistoryItem {
  id: string;
  testId: string;
  testTitle: string;
  testSlug: string;
  level: JlptLevel;
  category: JlptCategory;
  score: number;
  totalScore: number;
  passingScore: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface AdminJlptTestItem extends JlptTestItem {
  attemptsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminJlptQuestionItem extends JlptQuestionItem {
  correctAnswer: string;
  explanation?: string | null;
}

export interface AdminJlptTestDetail extends Omit<AdminJlptTestItem, 'questionCount'> {
  questions: AdminJlptQuestionItem[];
}

export type StoreCategory = 'DISCOUNT' | 'POWERUP' | 'AI_PERK' | 'COSMETIC';

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  category: StoreCategory;
  costCoins: number;
  icon: string;
  badge?: string | null;
  discountPercent?: number | null;
  durationDays?: number | null;
  actionKey?: string | null;
  isAvailable: boolean;
  order: number;
}

export interface UserInventoryItem {
  id: string;
  userId: string;
  itemId: string;
  code?: string | null;
  isUsed: boolean;
  expiresAt?: string | null;
  purchasedAt: string;
  item: StoreItem;
}

export interface UserCoinsState {
  id: string;
  coins: number;
  streakDays: number;
  streakFrozen: boolean;
  avatarFrame?: string | null;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  remainingCoins: number;
  inventoryItem: UserInventoryItem;
}

export interface DailyCheckinResponse {
  alreadyClaimed: boolean;
  earnedCoins?: number;
  streakDays: number;
  coins: number;
  message: string;
}

export interface AdminStoreItem extends StoreItem {
  _count?: {
    inventoryItems: number;
  };
  createdAt: string;
}

export interface AdminStoreStats {
  totalItems: number;
  totalPurchases: number;
  totalCoinsSpent: number;
  categories: Record<string, number>;
}

export interface AdminStorePurchase {
  id: string;
  userId: string;
  itemId: string;
  code?: string | null;
  isUsed: boolean;
  expiresAt?: string | null;
  purchasedAt: string;
  item: StoreItem;
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    coins: number;
  };
}

export interface KotobaItem {
  id: string;
  lessonId: string;
  word: string;
  furigana?: string;
  romaji?: string;
  meaningUz: string;
  meaningRu?: string;
  meaningEn?: string;
  partOfSpeech?: string;
  audioUrl?: string;
  sampleSentence?: string;
  sampleSentenceUz?: string;
  order: number;
}

export interface BunpouItem {
  id: string;
  lessonId: string;
  title: string;
  structure?: string;
  explanationUz: string;
  explanationRu?: string;
  examples: { japanese: string; romaji?: string; uzbek: string; russian?: string }[];
  order: number;
}

export interface KanjiItem {
  id: string;
  lessonId: string;
  character: string;
  onyomi?: string;
  kunyomi?: string;
  meaningUz: string;
  meaningRu?: string;
  strokeCount?: number;
  strokeOrderData?: string;
  radical?: string;
  examples: { word: string; reading: string; meaning: string }[];
  order: number;
}

export interface RenshuuItem {
  id: string;
  lessonId: string;
  type: 'QUIZ' | 'AUDIO_LISTENING' | 'FILL_BLANK' | 'MATCHING';
  question: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  order: number;
}

export interface UserDashboardStats {
  streakDays: number;
  wordsLearned: number;
  completedLessons: number;
  totalLessons: number;
  n5ProgressPercent: number;
  recentLessons: {
    id: string;
    title: string;
    japaneseTitle?: string;
    courseTitle: string;
    courseSlug: string;
    isCompleted: boolean;
    quizScore?: number | null;
  }[];
}

export interface LessonDetailsResponse {
  id: string;
  title: string;
  japaneseTitle?: string;
  slug?: string;
  order: number;
  videoUrl?: string;
  summary?: string;
  kaiwaScenario?: {
    topic?: string;
    partnerName?: string;
    goal?: string;
    sampleDialog?: { speaker: string; text: string; uz: string }[];
  };
  isLocked?: boolean;
  lockReason?: string;
  isProRequired?: boolean;
  module: {
    id: string;
    title: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
  };
  navigation: {
    prevLesson: { id: string; title: string; order: number } | null;
    nextLesson: { id: string; title: string; order: number } | null;
  };
  content: {
    kotoba: KotobaItem[];
    bunpou: BunpouItem[];
    kanji: KanjiItem[];
    renshuu: RenshuuItem[];
  };
  userProgress: {
    completedSections: string[];
    quizScore?: number | null;
    isCompleted: boolean;
    lastStudiedAt?: string;
  };
}

class ApiClient {
  private refreshPromise: Promise<boolean> | null = null;

  private getAuthHeader(token?: string | null): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const authToken =
      token === undefined ? localStorage.getItem('minna_access_token') : token;
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }

  private async tryRefreshTokens(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const refreshToken = localStorage.getItem('minna_refresh_token');
    if (!refreshToken) return false;

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (!res.ok) return false;
          const data = (await res.json()) as {
            accessToken?: string;
            refreshToken?: string;
          };
          if (!data.accessToken || !data.refreshToken) return false;
          localStorage.setItem('minna_access_token', data.accessToken);
          localStorage.setItem('minna_refresh_token', data.refreshToken);
          return true;
        } catch {
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${cleanEndpoint}`;
    const requestToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('minna_access_token')
        : null;

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...((options.headers as Record<string, string>) || {}),
      ...this.getAuthHeader(requestToken),
    };
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        const currentToken = localStorage.getItem('minna_access_token');
        const hadToken = !!requestToken;
        const isAuthEndpoint =
          cleanEndpoint.includes('/auth/otp') ||
          cleanEndpoint.includes('/auth/google') ||
          cleanEndpoint.includes('/auth/refresh');
        // Do not clear a newer session created while this request was in flight.
        const isCurrentSession = requestToken === currentToken;
        if (hadToken && isCurrentSession && !isAuthEndpoint) {
          if (!isRetry && (await this.tryRefreshTokens())) {
            return this.request<T>(endpoint, options, true);
          }
          localStorage.removeItem('minna_access_token');
          localStorage.removeItem('minna_refresh_token');
          localStorage.removeItem('minna_user');
          const lang = localStorage.getItem('minna-lang') || 'uz';
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = `/${lang}/auth/login?revoked=true`;
          }
        }
      }

      const message =
        data.message ||
        (Array.isArray(data.message) ? data.message.join(', ') : 'Server xatoligi');
      throw new Error(message);
    }

    return data as T;
  }

  // === AUTH APIS ===
  async sendOtp(email: string) {
    return this.request<{
      success: boolean;
      message: string;
      expiresInSeconds: number;
      devCode?: string;
    }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, code: string, deviceName?: string) {
    return this.request<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, deviceName }),
    });
  }

  async googleAuth(token: string, deviceName?: string) {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token, deviceName }),
    });
  }

  async getMe() {
    return this.request<User>('/auth/me');
  }

  async getDevices() {
    return this.request<DeviceSession[]>('/auth/devices');
  }

  async revokeDevice(deviceId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/auth/devices/${deviceId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('minna_access_token');
        localStorage.removeItem('minna_refresh_token');
        localStorage.removeItem('minna_user');
      }
    }
  }

  // === PROFILE AVATAR MANAGEMENT ===
  async uploadAvatar(file: File) {
    try {
      const direct = await this.directUpload(file, 'avatars');
      return await this.request<User>('/auth/avatar/url', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl: direct.url }),
      });
    } catch (directErr) {
      console.warn('Direct avatar upload failed, falling back to server upload:', directErr);
      const formData = new FormData();
      formData.append('file', file);
      return this.request<User>('/auth/avatar', {
        method: 'POST',
        body: formData,
      });
    }
  }

  async selectGoogleAvatar() {
    return this.request<User>('/auth/avatar/google', {
      method: 'POST',
    });
  }

  async removeAvatar() {
    return this.request<User>('/auth/avatar', {
      method: 'DELETE',
    });
  }

  async updateProfile(data: { fullName?: string }) {
    return this.request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // === STUDENT COURSES & LESSONS ===
  async getUserDashboardStats() {
    return this.request<UserDashboardStats>('/courses/user/stats');
  }

  async logStudyTime(minutes: number = 1) {
    return this.request<{ success: boolean }>('/courses/user/study-time', {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    });
  }

  async getStudyPlan() {
    return this.request<UserStudyPlan>('/courses/user/study-plan');
  }

  async saveStudyPlan(data: Partial<UserStudyPlan>) {
    return this.request<UserStudyPlan>('/courses/user/study-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === BANNERS API ===
  async getBanners() {
    return this.request<BannerItem[]>('/banners');
  }

  async getAllBannersAdmin() {
    return this.request<BannerItem[]>('/banners/admin');
  }

  async createBanner(data: CreateBannerDto) {
    return this.request<BannerItem>('/banners/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBanner(id: string, data: Partial<CreateBannerDto>) {
    return this.request<BannerItem>(`/banners/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleBannerActive(id: string) {
    return this.request<BannerItem>(`/banners/admin/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async reorderBanners(bannerIds: string[]) {
    return this.request<{ success: boolean; message: string }>('/banners/admin/reorder', {
      method: 'PUT',
      body: JSON.stringify({ bannerIds }),
    });
  }

  async deleteBanner(id: string) {
    return this.request<{ success: boolean; message: string }>(`/banners/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // === NOTIFICATIONS API ===
  async getUserNotifications() {
    return this.request<NotificationItem[]>('/notifications');
  }

  async getNotificationById(id: string) {
    return this.request<NotificationItem>(`/notifications/${id}`);
  }

  async getUnreadNotificationCount() {
    return this.request<{ unreadCount: number }>('/notifications/unread-count');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    });
  }

  async getAllNotificationsAdmin() {
    return this.request<NotificationItem[]>('/notifications/admin');
  }

  async createNotification(data: CreateNotificationDto) {
    return this.request<NotificationItem>('/notifications/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteNotification(id: string) {
    return this.request<{ success: boolean; message: string }>(`/notifications/admin/${id}`, {
      method: 'DELETE',
    });
  }

  async getCourses() {
    return this.request<CourseListItem[]>('/courses');
  }

  async getCourseDetails(courseIdOrSlug: string) {
    return this.request<CourseDetailsResponse>(`/courses/${courseIdOrSlug}`);
  }

  async getLesson(courseId: string, lessonId: string) {
    return this.request<LessonDetailsResponse>(`/courses/${courseId}/lessons/${lessonId}`);
  }

  async updateLessonProgress(
    courseId: string,
    lessonId: string,
    data: { completedSections?: string[]; quizScore?: number; isCompleted?: boolean },
  ) {
    return this.request<{ success: boolean; progress: any }>(
      `/courses/${courseId}/lessons/${lessonId}/progress`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  // === VOCABULARY & FLASHCARDS APIS ===
  async getAllVocab() {
    return this.request<UserVocabResponse>('/courses/vocab/all');
  }

  async getVocabStats() {
    return this.request<VocabStatsResponse>('/courses/vocab/stats');
  }

  async toggleVocabFlashcard(kotobaId: string, status?: FlashcardStatus) {
    return this.request<any>('/courses/vocab/flashcards', {
      method: 'POST',
      body: JSON.stringify({ kotobaId, status }),
    });
  }

  async batchAddVocabFlashcards(kotobaIds: string[], status?: FlashcardStatus) {
    return this.request<{ success: boolean; count: number }>('/courses/vocab/flashcards/batch', {
      method: 'POST',
      body: JSON.stringify({ kotobaIds, status }),
    });
  }

  async removeVocabFlashcard(kotobaId: string) {
    return this.request<{ success: boolean }>(`/courses/vocab/flashcards/${kotobaId}`, {
      method: 'DELETE',
    });
  }

  async batchRemoveVocabFlashcards(kotobaIds: string[]) {
    return this.request<{ success: boolean; count: number }>('/courses/vocab/flashcards/batch-remove', {
      method: 'POST',
      body: JSON.stringify({ kotobaIds }),
    });
  }

  // === KANJI & FLASHCARDS APIS ===
  async getAllKanji() {
    return this.request<UserKanjiResponse>('/courses/kanji/all');
  }

  async getKanjiStats() {
    return this.request<KanjiStatsResponse>('/courses/kanji/stats');
  }

  async toggleKanjiFlashcard(kanjiId: string, status?: FlashcardStatus) {
    return this.request<any>('/courses/kanji/flashcards', {
      method: 'POST',
      body: JSON.stringify({ kanjiId, status }),
    });
  }

  async batchAddKanjiFlashcards(kanjiIds: string[], status?: FlashcardStatus) {
    return this.request<{ success: boolean; count: number }>('/courses/kanji/flashcards/batch', {
      method: 'POST',
      body: JSON.stringify({ kanjiIds, status }),
    });
  }

  async removeKanjiFlashcard(kanjiId: string) {
    return this.request<{ success: boolean }>(`/courses/kanji/flashcards/${kanjiId}`, {
      method: 'DELETE',
    });
  }

  async batchRemoveKanjiFlashcards(kanjiIds: string[]) {
    return this.request<{ success: boolean; count: number }>('/courses/kanji/flashcards/batch-remove', {
      method: 'POST',
      body: JSON.stringify({ kanjiIds }),
    });
  }

  // === GLOBAL SEARCH API ===
  async globalSearch(query: string) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    return this.request<GlobalSearchResult>(`/search?${params.toString()}`);
  }

  // === ADMIN PANEL APIS ===

  async getAdminUserStats() {
    return this.request<AdminUserStats>('/admin/users/stats');
  }

  async getAdminUsers(params: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const queryString = query.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.request<AdminUsersResponse>(endpoint);
  }

  async getAdminUser(id: string) {
    return this.request<AdminUserItem & { sessions: DeviceSession[] }>(`/admin/users/${id}`);
  }

  async createAdminUser(data: {
    email: string;
    fullName?: string;
    role?: string;
    isVerified?: boolean;
  }) {
    return this.request<AdminUserItem>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUser(
    id: string,
    data: {
      fullName?: string;
      role?: string;
      isVerified?: boolean;
      avatarUrl?: string;
    },
  ) {
    return this.request<AdminUserItem>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminUser(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async revokeAdminUserDevice(userId: string, deviceId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/users/${userId}/devices/${deviceId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // === ADMIN COURSES CRUD ===

  async getAdminCourses() {
    return this.request<any[]>('/admin/courses');
  }

  async getAdminCourse(id: string) {
    return this.request<any>(`/admin/courses/${id}`);
  }

  async createAdminCourse(data: any) {
    return this.request<any>('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminCourse(id: string, data: any) {
    return this.request<any>(`/admin/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminCourse(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Modules
  async createAdminModule(courseId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminModule(courseId: string, moduleId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/modules/${moduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminModule(courseId: string, moduleId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/courses/${courseId}/modules/${moduleId}`,
      { method: 'DELETE' },
    );
  }

  // Admin Lessons
  async createAdminLesson(courseId: string, moduleId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminLesson(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminLesson(courseId: string, lessonId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/admin/courses/${courseId}/lessons/${lessonId}`,
      { method: 'DELETE' },
    );
  }

  // Admin Lesson Content
  async getAdminLessonContent(courseId: string, lessonId: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/content`);
  }

  async saveAdminKotoba(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kotoba`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminKotoba(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kotoba/${id}`, {
      method: 'DELETE',
    });
  }

  async saveAdminBunpou(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/bunpou`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminBunpou(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/bunpou/${id}`, {
      method: 'DELETE',
    });
  }

  async saveAdminKanji(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kanji`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminKanji(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/kanji/${id}`, {
      method: 'DELETE',
    });
  }

  async saveAdminRenshuu(courseId: string, lessonId: string, data: any) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/renshuu`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminRenshuu(courseId: string, lessonId: string, id: string) {
    return this.request<any>(`/admin/courses/${courseId}/lessons/${lessonId}/renshuu/${id}`, {
      method: 'DELETE',
    });
  }

  // === FILE UPLOADS (CLOUDFLARE R2 DIRECT UPLOAD + FALLBACK) ===
  async directUpload(
    file: File,
    category: StorageCategory,
    onProgress?: (percent: number) => void,
  ): Promise<{
    success: boolean;
    fileId: string;
    objectKey: string;
    url: string;
    originalName: string;
    size: number;
    filename: string;
    isPublic: boolean;
  }> {
    // 1. Presigned upload URL olish
    const presigned = await this.request<PresignedUrlResponse>('/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        mimetype: file.type || 'application/octet-stream',
        size: file.size,
        category,
      }),
    });

    // 2. Direct PUT to Cloudflare R2 via XMLHttpRequest (progress event qo\'llab-quvvatlash uchun)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presigned.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(new Error(`Cloudflare R2 ga yuklashda xatolik yuz berdi (HTTP ${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Cloudflare R2 ga yuklashda tarmoq xatosi yuz berdi'));
      };

      xhr.send(file);
    });

    // 3. Backend tasdiqlashi (COMPLETED holatiga o'tkazish)
    const completed = await this.request<CompleteUploadResponse>('/upload/complete', {
      method: 'POST',
      body: JSON.stringify({ fileId: presigned.fileId }),
    });

    const finalUrl = completed.url || presigned.publicUrl || presigned.objectKey;

    return {
      success: true,
      fileId: completed.fileId,
      objectKey: completed.objectKey,
      url: finalUrl,
      originalName: file.name,
      size: file.size,
      filename: file.name,
      isPublic: completed.isPublic,
    };
  }

  async getFileDownloadUrl(fileId: string) {
    return this.request<{
      success: boolean;
      url: string;
      isPublic: boolean;
      expiresIn?: number;
    }>(`/upload/file/${fileId}/download-url`);
  }

  async uploadVideo(file: File, onProgress?: (percent: number) => void) {
    try {
      return await this.directUpload(file, 'videos', onProgress);
    } catch (directErr) {
      console.warn('Direct upload to R2 failed, falling back to server upload:', directErr);
      const formData = new FormData();
      formData.append('file', file);
      return this.request<{
        success: boolean;
        url: string;
        originalName: string;
        size: number;
        filename: string;
      }>('/upload/video', {
        method: 'POST',
        body: formData,
      });
    }
  }

  // === JLPT TESTS & MOCK EXAMS ===
  async getJlptTests(params?: { level?: JlptLevel; category?: JlptCategory }) {
    const query = new URLSearchParams();
    if (params?.level) query.set('level', params.level);
    if (params?.category) query.set('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<JlptTestItem[]>(`/tests${qs}`);
  }

  async getJlptTestStats() {
    return this.request<JlptTestStats>('/tests/stats');
  }

  async getJlptTestHistory(limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return this.request<JlptUserTestHistoryItem[]>(`/tests/history${qs}`);
  }

  async getJlptTestBySlug(slug: string) {
    return this.request<JlptTestDetail>(`/tests/${slug}`);
  }

  async submitJlptTest(
    testId: string,
    data: { answers: { questionId: string; selectedAnswer: string }[]; timeSpentSeconds: number }
  ) {
    return this.request<TestSubmitResponse>(`/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJlptTestResult(resultId: string) {
    return this.request<TestSubmitResponse>(`/tests/results/${resultId}`);
  }

  // === ADMIN JLPT TESTS & QUESTIONS ===
  async adminGetTests() {
    return this.request<AdminJlptTestItem[]>('/admin/tests');
  }

  async adminGetTest(id: string) {
    return this.request<AdminJlptTestDetail>(`/admin/tests/${id}`);
  }

  async adminCreateTest(data: any) {
    return this.request<AdminJlptTestItem>('/admin/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateTest(id: string, data: any) {
    return this.request<AdminJlptTestItem>(`/admin/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteTest(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/tests/${id}`, {
      method: 'DELETE',
    });
  }

  async adminAddQuestion(testId: string, data: any) {
    return this.request<AdminJlptQuestionItem>(`/admin/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateQuestion(questionId: string, data: any) {
    return this.request<AdminJlptQuestionItem>(`/admin/tests/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteQuestion(questionId: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/tests/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  async uploadAudio(file: File, onProgress?: (percent: number) => void) {
    try {
      return await this.directUpload(file, 'audio', onProgress);
    } catch (directErr) {
      console.warn('Direct audio upload to R2 failed, falling back to server upload:', directErr);
      const formData = new FormData();
      formData.append('file', file);
      return this.request<{
        success: boolean;
        url: string;
        originalName: string;
        size: number;
        filename: string;
      }>('/upload/audio', {
        method: 'POST',
        body: formData,
      });
    }
  }

  async uploadImage(file: File, onProgress?: (percent: number) => void) {
    try {
      return await this.directUpload(file, 'images', onProgress);
    } catch (directErr) {
      console.warn('Direct image upload to R2 failed, falling back to server upload:', directErr);
      const formData = new FormData();
      formData.append('file', file);
      return this.request<{
        success: boolean;
        url: string;
        originalName: string;
        size: number;
        filename: string;
      }>('/upload/image', {
        method: 'POST',
        body: formData,
      });
    }
  }

  // === SHOP & COINS ===
  async getStoreItems() {
    return this.request<StoreItem[]>('/shop/items');
  }

  async getUserInventory() {
    return this.request<UserInventoryItem[]>('/shop/inventory');
  }

  async purchaseStoreItem(itemId: string) {
    return this.request<PurchaseResponse>(`/shop/purchase/${itemId}`, {
      method: 'POST',
    });
  }

  async equipAvatarFrame(frameKey: string | null) {
    return this.request<{ id: string; avatarFrame: string | null }>('/shop/equip-frame', {
      method: 'POST',
      body: JSON.stringify({ frameKey }),
    });
  }

  async getUserCoins() {
    return this.request<UserCoinsState>('/coins/balance');
  }

  async getCoinHistory() {
    return this.request<CoinTransaction[]>('/coins/history');
  }

  async dailyCheckin() {
    return this.request<DailyCheckinResponse>('/coins/daily-checkin', {
      method: 'POST',
    });
  }

  // === ADMIN SHOP API ===
  async adminGetStoreStats() {
    return this.request<AdminStoreStats>('/admin/shop/stats');
  }

  async adminGetStoreItems() {
    return this.request<AdminStoreItem[]>('/admin/shop/items');
  }

  async adminCreateStoreItem(data: any) {
    return this.request<StoreItem>('/admin/shop/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateStoreItem(id: string, data: any) {
    return this.request<StoreItem>(`/admin/shop/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteStoreItem(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/shop/items/${id}`, {
      method: 'DELETE',
    });
  }

  async adminGetStorePurchases() {
    return this.request<AdminStorePurchase[]>('/admin/shop/purchases');
  }

  // === SUBSCRIPTIONS & BILLING API ===
  async getSubscriptionPlans() {
    return this.request<SubscriptionPlanItem[]>('/subscriptions/plans');
  }

  async getMySubscription() {
    return this.request<MySubscriptionResponse>('/subscriptions/my-status');
  }

  async validateSubscriptionCode(code: string, tier: SubscriptionTier) {
    return this.request<ValidateCodeResponse>('/subscriptions/validate-code', {
      method: 'POST',
      body: JSON.stringify({ code, tier }),
    });
  }

  async checkoutSubscription(data: {
    tier: SubscriptionTier;
    provider: PaymentProvider;
    promoCode?: string;
  }) {
    return this.request<CheckoutResponse>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async simulatePayment(transactionId: string) {
    return this.request<{ success: boolean; message: string; subscription: any }>('/subscriptions/simulate-payment', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    });
  }

  async cancelSubscription() {
    return this.request<{ success: boolean; message: string }>('/subscriptions/cancel', {
      method: 'POST',
    });
  }

  // === ADMIN SUBSCRIPTIONS API ===
  async adminGetSubscriptions(page = 1, limit = 20, status?: string) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) q.append('status', status);
    return this.request<AdminSubscriptionsResponse>(`/admin/subscriptions?${q.toString()}`);
  }

  async adminGetSubscriptionStats() {
    return this.request<AdminSubscriptionStats>('/admin/subscriptions/stats');
  }

  async adminGrantSubscription(data: {
    userId: string;
    tier: SubscriptionTier;
    durationDays: number;
    notes?: string;
  }) {
    return this.request<{ success: boolean; message: string; subscription: any }>('/admin/subscriptions/grant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === ADMIN PLANS CRUD ===
  async adminGetAllPlans() {
    return this.request<SubscriptionPlanItem[]>('/admin/subscriptions/plans');
  }

  async adminCreatePlan(data: Partial<SubscriptionPlanItem>) {
    return this.request<SubscriptionPlanItem>('/admin/subscriptions/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdatePlan(id: string, data: Partial<SubscriptionPlanItem>) {
    return this.request<SubscriptionPlanItem>(`/admin/subscriptions/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async adminDeletePlan(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/subscriptions/plans/${id}`, {
      method: 'DELETE',
    });
  }

  async adminTogglePlan(id: string) {
    return this.request<SubscriptionPlanItem>(`/admin/subscriptions/plans/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // === ADMIN USER SUBSCRIPTIONS CRUD ===
  async adminUpdateUserSubscription(id: string, data: any) {
    return this.request<AdminSubscriptionItem>(`/admin/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async adminExtendUserSubscription(id: string, days: number) {
    return this.request<AdminSubscriptionItem>(`/admin/subscriptions/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  }

  async adminDeleteUserSubscription(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // === AI API ===
  async translate(text: string, direction: 'ja-uz' | 'uz-ja'): Promise<TranslateResponse> {
    return this.request<TranslateResponse>('/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text, direction }),
    });
  }

  async sendKaiwaMessage(data: {
    lessonId: string;
    lessonTitle?: string;
    topic?: string;
    goal?: string;
    partnerName?: string;
    kotobaWords?: string[];
    history: { sender: 'ai' | 'user'; japanese: string; romaji?: string; uzbek?: string }[];
    userMessage: string;
    step: number;
  }): Promise<KaiwaResponse> {
    return this.request<KaiwaResponse>('/ai/kaiwa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async explainMistake(data: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
    level?: string;
  }): Promise<ExplainMistakeResponse> {
    return this.request<ExplainMistakeResponse>('/ai/explain-mistake', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateDokkai(data: {
    level: 'N5' | 'N4' | 'N3';
    topic: string;
  }): Promise<GeneratedDokkaiResponse> {
    return this.request<GeneratedDokkaiResponse>('/ai/generate-dokkai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // TEACHER PORTAL METHODS
  // ==========================================
  async getTeacherStats(): Promise<TeacherStatsResponse> {
    return this.request<TeacherStatsResponse>('/teacher/stats');
  }

  async getTeacherCourses(): Promise<any[]> {
    return this.request<any[]>('/teacher/courses');
  }

  async getTeacherCourse(id: string): Promise<any> {
    return this.request<any>(`/teacher/courses/${id}`);
  }

  async updateTeacherCourse(id: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createTeacherModule(courseId: string, data: { title: string; description?: string; order?: number }): Promise<any> {
    return this.request<any>(`/teacher/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherModule(courseId: string, moduleId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/${courseId}/modules/${moduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacherModule(courseId: string, moduleId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/teacher/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
    });
  }

  async createTeacherLesson(courseId: string, moduleId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherLesson(courseId: string, lessonId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/${courseId}/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async requestDeleteTeacherLesson(courseId: string, lessonId: string, reason: string): Promise<any> {
    return this.request<any>(`/teacher/courses/${courseId}/lessons/${lessonId}/request-delete`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async cancelDeleteTeacherLesson(courseId: string, lessonId: string): Promise<any> {
    return this.request<any>(`/teacher/courses/${courseId}/lessons/${lessonId}/cancel-delete`, {
      method: 'POST',
    });
  }

  async getTeacherLessonContent(lessonId: string): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/${lessonId}/content`);
  }

  async addTeacherKotoba(lessonId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/${lessonId}/kotoba`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherKotoba(id: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/kotoba/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacherKotoba(id: string): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/kotoba/${id}`, {
      method: 'DELETE',
    });
  }

  async addTeacherBunpou(lessonId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/${lessonId}/bunpou`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherBunpou(id: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/bunpou/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacherBunpou(id: string): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/bunpou/${id}`, {
      method: 'DELETE',
    });
  }

  async addTeacherKanji(lessonId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/${lessonId}/kanji`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherKanji(id: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/kanji/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacherKanji(id: string): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/kanji/${id}`, {
      method: 'DELETE',
    });
  }

  async addTeacherRenshuu(lessonId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/${lessonId}/renshuu`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherRenshuu(id: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/renshuu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacherRenshuu(id: string): Promise<any> {
    return this.request<any>(`/teacher/courses/lessons/renshuu/${id}`, {
      method: 'DELETE',
    });
  }

  async getTeacherStudents(params?: { courseId?: string; search?: string }): Promise<TeacherStudentItem[]> {
    const query = new URLSearchParams();
    if (params?.courseId) query.set('courseId', params.courseId);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<TeacherStudentItem[]>(`/teacher/students${qs}`);
  }

  async getTeacherStudentDetail(studentId: string): Promise<any> {
    return this.request<any>(`/teacher/students/${studentId}`);
  }

  async sendTeacherFeedback(data: {
    studentId: string;
    courseId?: string;
    lessonId?: string;
    title?: string;
    comment: string;
    rating?: number;
  }): Promise<{ success: boolean; message: string; feedback: any }> {
    return this.request<{ success: boolean; message: string; feedback: any }>('/teacher/students/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeacherFeedbacks(studentId?: string): Promise<any[]> {
    const qs = studentId ? `?studentId=${studentId}` : '';
    return this.request<any[]>(`/teacher/feedbacks${qs}`);
  }

  async sendTeacherAnnouncement(data: {
    courseId: string;
    title: string;
    message: string;
  }): Promise<{ success: boolean; message: string; sentCount: number }> {
    return this.request<{ success: boolean; message: string; sentCount: number }>('/teacher/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeacherTests(): Promise<any[]> {
    return this.request<any[]>('/teacher/tests');
  }

  async getTeacherTest(id: string): Promise<any> {
    return this.request<any>(`/teacher/tests/${id}`);
  }

  async createTeacherTest(data: any): Promise<any> {
    return this.request<any>('/teacher/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherTest(id: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacherTest(id: string): Promise<any> {
    return this.request<any>(`/teacher/tests/${id}`, {
      method: 'DELETE',
    });
  }

  async createTeacherQuestion(testId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeacherQuestion(questionId: string, data: any): Promise<any> {
    return this.request<any>(`/teacher/tests/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacherQuestion(questionId: string): Promise<any> {
    return this.request<any>(`/teacher/tests/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // ADMIN TEACHERS MANAGEMENT METHODS
  // ==========================================
  async getAdminTeachers(): Promise<AdminTeacherItem[]> {
    return this.request<AdminTeacherItem[]>('/admin/teachers');
  }

  async assignAdminTeacherRole(userId: string): Promise<any> {
    return this.request<any>(`/admin/teachers/${userId}/assign-role`, {
      method: 'POST',
    });
  }

  async removeAdminTeacherRole(userId: string): Promise<any> {
    return this.request<any>(`/admin/teachers/${userId}/remove-role`, {
      method: 'POST',
    });
  }

  async assignAdminCourseToTeacher(courseId: string, teacherId: string): Promise<any> {
    return this.request<any>('/admin/teachers/assign-course', {
      method: 'PATCH',
      body: JSON.stringify({ courseId, teacherId }),
    });
  }

  async getAdminDeletionRequests(): Promise<AdminDeletionRequestItem[]> {
    return this.request<AdminDeletionRequestItem[]>('/admin/teachers/deletion-requests');
  }

  async approveAdminDeletionRequest(lessonId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/admin/teachers/deletion-requests/${lessonId}/approve`, {
      method: 'POST',
    });
  }

  async rejectAdminDeletionRequest(lessonId: string): Promise<{ success: boolean; message: string; lesson: any }> {
    return this.request<{ success: boolean; message: string; lesson: any }>(`/admin/teachers/deletion-requests/${lessonId}/reject`, {
      method: 'POST',
    });
  }
}

export interface TranslateResponse {
  translation: string;
  romaji?: string;
  furigana?: string;
  notes?: string;
}

export interface KaiwaResponse {
  japanese: string;
  romaji: string;
  uzbek: string;
  correction?: string;
  encouragement?: string;
  isCompleted: boolean;
  summary?: {
    accuracyPercent: number;
    wordsUsedCount: number;
    feedback: string;
    rewardCoins: number;
  };
  coinsAwarded?: number;
  newBalance?: number;
}

export interface ExplainMistakeResponse {
  whyWrong: string;
  whyCorrect: string;
  tip: string;
}

export interface GeneratedDokkaiResponse {
  title: string;
  titleUz: string;
  readingTime: string;
  japaneseText: string;
  furiganaText: string;
  uzbekTranslation: string;
  vocabulary: { word: string; meaning: string }[];
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// === SUBSCRIPTIONS TYPES ===
export type SubscriptionTier = 'FREE' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'LIFETIME';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
export type PaymentProvider = 'PAYME' | 'CLICK' | 'UZUM' | 'STRIPE' | 'ADMIN_MANUAL';

export interface SubscriptionPlanItem {
  id: string;
  tier: SubscriptionTier;
  name: string;
  nameRu?: string | null;
  priceUzs: number;
  durationDays: number;
  features: string[];
  popular: boolean;
  tag?: string | null;
  order: number;
  isActive?: boolean;
}

export interface UserSubscriptionItem {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: PaymentProvider;
  daysRemaining: number;
  plan?: SubscriptionPlanItem | null;
}

export interface AvailableDiscountItem {
  id: string;
  code: string;
  title: string;
  discountPercent: number;
  expiresAt?: string | null;
}

export interface MySubscriptionResponse {
  isPro: boolean;
  isPrivileged: boolean;
  subscription: UserSubscriptionItem | null;
  availableDiscounts: AvailableDiscountItem[];
}

export interface ValidateCodeResponse {
  valid: boolean;
  code: string;
  discountPercent: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  inventoryItemId?: string | null;
}

export interface CheckoutResponse {
  transactionId: string;
  plan: {
    tier: SubscriptionTier;
    name: string;
    durationDays: number;
  };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promoCode?: string;
  provider: PaymentProvider;
  status: string;
}

export interface AdminSubscriptionItem extends UserSubscriptionItem {
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role: string;
  };
  transactions: {
    id: string;
    finalAmountUzs: number;
    provider: PaymentProvider;
    status: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface AdminSubscriptionsResponse {
  items: AdminSubscriptionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminSubscriptionStats {
  activeSubscribers: number;
  totalSubscriptions: number;
  totalRevenueUzs: number;
  plansBreakdown: Record<string, number>;
}

export interface TeacherStatsResponse {
  coursesCount: number;
  lessonsCount: number;
  studentsCount: number;
  testsCount: number;
  pendingDeletionCount: number;
  recentActivities: {
    id: string;
    studentName: string;
    studentEmail: string;
    studentAvatar?: string | null;
    lessonTitle: string;
    lessonOrder: number;
    isCompleted: boolean;
    quizScore?: number | null;
    studiedAt: string;
  }[];
}

export interface TeacherStudentItem {
  studentId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  courseId: string;
  courseTitle: string;
  courseLevel: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercent: number;
  lastActivityAt: string;
  averageQuizScore?: number | null;
}

export interface AdminTeacherItem {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  createdAt: string;
  coursesCount: number;
  lessonsCount: number;
  pendingDeletionCount: number;
  courses: {
    id: string;
    title: string;
    level: string;
    isPublished: boolean;
  }[];
}

export interface AdminDeletionRequestItem {
  id: string;
  title: string;
  order: number;
  deleteRequested: boolean;
  deleteReason?: string | null;
  updatedAt: string;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      author?: {
        id: string;
        fullName?: string | null;
        email: string;
        avatarUrl?: string | null;
      } | null;
    };
  };
}

export const api = new ApiClient();
