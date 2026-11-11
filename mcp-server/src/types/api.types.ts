export type CourseLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER';

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  level: CourseLevel;
  coverImage?: string | null;
  modulesCount?: number;
  lessonsCount?: number;
  progressPercentage?: number;
}

export interface LessonSummaryItem {
  id: string;
  title: string;
  japaneseTitle?: string | null;
  slug?: string | null;
  order: number;
  isFree: boolean;
  isCompleted?: boolean;
}

export interface CourseModuleDetail {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: LessonSummaryItem[];
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  level: CourseLevel;
  coverImage?: string | null;
  modules: CourseModuleDetail[];
  totalLessons?: number;
  completedLessons?: number;
}

export interface KotobaItemDto {
  id: string;
  word: string;
  furigana?: string | null;
  romaji?: string | null;
  meaningUz: string;
  meaningRu?: string | null;
  meaningEn?: string | null;
  partOfSpeech?: string | null;
  audioUrl?: string | null;
  sampleSentence?: string | null;
  sampleSentenceUz?: string | null;
  order: number;
  status?: 'LEARNING' | 'MASTERED' | null;
}

export interface BunpouItemDto {
  id: string;
  title: string;
  structure?: string | null;
  explanationUz: string;
  explanationRu?: string | null;
  examples?: Array<{ japanese: string; romaji: string; uzbek: string }> | null;
  order: number;
}

export interface KanjiItemDto {
  id: string;
  character: string;
  onyomi?: string | null;
  kunyomi?: string | null;
  meaningUz: string;
  meaningRu?: string | null;
  strokeCount?: number | null;
  radical?: string | null;
  examples?: Array<{ word: string; reading: string; meaning: string }> | null;
  order: number;
  status?: 'LEARNING' | 'MASTERED' | null;
}

export interface RenshuuItemDto {
  id: string;
  type: string;
  question: string;
  audioUrl?: string | null;
  options?: string[] | null;
  order: number;
}

export interface LessonDetail {
  id: string;
  moduleId: string;
  title: string;
  japaneseTitle?: string | null;
  slug?: string | null;
  order: number;
  videoUrl?: string | null;
  summary?: string | null;
  isFree: boolean;
  isLocked?: boolean;
  requiredTier?: string;
  kotobaItems?: KotobaItemDto[];
  bunpouItems?: BunpouItemDto[];
  kanjiItems?: KanjiItemDto[];
  renshuuItems?: RenshuuItemDto[];
  kaiwaScenario?: Record<string, unknown> | null;
  isCompleted?: boolean;
  completedSections?: string[];
  quizScore?: number | null;
}

export interface UserStatsDto {
  streakDays: number;
  streakFrozen: boolean;
  coins: number;
  completedLessons: number;
  totalLessons: number;
  learnedKotobaCount: number;
  masteredKotobaCount: number;
  learnedKanjiCount: number;
  masteredKanjiCount: number;
  todayMinutesSpent: number;
  weeklyGoalHours: number;
  targetLevel: CourseLevel;
}

export interface UserStudyPlanDto {
  targetLevel: CourseLevel;
  weeklyGoalHours: number;
  dailyMinutes: number;
  targetMonths: number;
  isConfigured: boolean;
}

export interface UserSubscriptionDto {
  tier: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  planName?: string;
  isPro: boolean;
}

export interface JlptTestSummary {
  id: string;
  title: string;
  slug: string;
  level: CourseLevel;
  category: string;
  durationMinutes: number;
  passingScore: number;
  totalScore: number;
  isPremium: boolean;
  questionsCount?: number;
  bestScore?: number | null;
}

export interface JlptQuestionDto {
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

export interface JlptTestDetail {
  id: string;
  title: string;
  slug: string;
  level: CourseLevel;
  category: string;
  durationMinutes: number;
  passingScore: number;
  totalScore: number;
  audioUrl?: string | null;
  questions: JlptQuestionDto[];
}

export interface GlobalSearchResultItem {
  courses: Array<{ id: string; title: string; slug: string; level: string }>;
  lessons: Array<{ id: string; title: string; japaneseTitle?: string | null; courseTitle: string; courseLevel: string }>;
  vocab: Array<{ id: string; word: string; furigana?: string | null; meaningUz: string; courseLevel: string }>;
  kanji: Array<{ id: string; character: string; onyomi?: string | null; meaningUz: string; courseLevel: string }>;
  tests: Array<{ id: string; title: string; slug: string; level: string; category: string }>;
}

export interface TranslateResultDto {
  translatedText: string;
  originalText: string;
  direction: string;
}

