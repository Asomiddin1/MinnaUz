'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RotateCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Video,
  FileText,
  PenTool,
  Check,
  X,
  Bot,
  Lightbulb,
  Menu,
  Lock,
  Crown,
} from 'lucide-react';
import { api, API_ORIGIN, LessonDetailsResponse } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { KitsuneMessage } from '@/components/kitsune/kitsune-message';
import { lessonKitsuneState, type ProgressSaveState } from '@/lib/kitsune/state';

type TabKey = 'video' | 'kotoba' | 'bunpou' | 'kanji' | 'renshuu' | 'kaiwa';

export default function LessonPlayerPage() {
  const params = useParams();
  return <LessonPlayer key={`${params.courseId}/${params.lessonId}`} />;
}

function LessonPlayer() {
  const { lang, t } = useLang();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = React.useState<LessonDetailsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Active view tab state (default: 'video' or 'kotoba')
  const [activeTab, setActiveTab] = React.useState<TabKey>('video');

  // Video Player state (Sidebar mini rejimini ham boshqaradi)
  const [theaterMode, setTheaterMode] = React.useState(false);

  // Kotoba Flashcard state
  const [flashcardIndex, setFlashcardIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showFurigana, setShowFurigana] = React.useState(true);
  const [kotobaViewMode, setKotobaViewMode] = React.useState<'flashcard' | 'list'>('flashcard');

  // Renshuu Quiz state
  const [quizAnswers, setQuizAnswers] = React.useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);
  const [quizScore, setQuizScore] = React.useState<number | null>(null);
  const [progressSaveState, setProgressSaveState] = React.useState<ProgressSaveState>('idle');
  const pendingProgress = React.useRef<Parameters<typeof api.updateLessonProgress>[2] | null>(null);
  const savingProgress = React.useRef(false);

  // AI Kaiwa State (5-step bounded speaking practice)
  const [kaiwaStarted, setKaiwaStarted] = React.useState(false);
  const [kaiwaStep, setKaiwaStep] = React.useState(1);
  const [kaiwaInput, setKaiwaInput] = React.useState('');
  const [kaiwaLoading, setKaiwaLoading] = React.useState(false);
  const [kaiwaMessages, setKaiwaMessages] = React.useState<
    {
      sender: 'ai' | 'user';
      japanese: string;
      romaji?: string;
      uzbek?: string;
      correction?: string;
      encouragement?: string;
    }[]
  >([]);
  const [kaiwaSummary, setKaiwaSummary] = React.useState<{
    accuracyPercent: number;
    wordsUsedCount: number;
    feedback: string;
    rewardCoins: number;
  } | null>(null);
  const [kaiwaRewardAwarded, setKaiwaRewardAwarded] = React.useState<number | null>(null);

  // AI Explainer State for Renshuu
  const [aiExplanations, setAiExplanations] = React.useState<
    Record<number, { whyWrong: string; whyCorrect: string; tip: string; loading?: boolean }>
  >({});

  // Completed tabs
  const [completedSections, setCompletedSections] = React.useState<string[]>([]);
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    async function loadLesson() {
      try {
        const data = await api.getLesson(courseId, lessonId);
        setLesson(data);
        if (data.userProgress) {
          setCompletedSections(data.userProgress.completedSections || []);
          setIsCompleted(data.userProgress.isCompleted);
          if (data.userProgress.quizScore !== null && data.userProgress.quizScore !== undefined) {
            setQuizScore(data.userProgress.quizScore);
          }
        }
        if (!data.videoUrl) {
          setActiveTab('kotoba');
        }
      } catch (err: any) {
        setError(err.message || 'Darsni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [courseId, lessonId]);

  // Audio Speech Synthesis for Japanese
  const playJapaneseAudio = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const saveProgress = async (data: Parameters<typeof api.updateLessonProgress>[2]) => {
    if (savingProgress.current) return false;
    savingProgress.current = true;
    // Retain a failed quiz save when the learner completes another section.
    const payload = {
      ...pendingProgress.current,
      ...data,
      completedSections: Array.from(new Set([
        ...completedSections,
        ...(pendingProgress.current?.completedSections ?? []),
        ...(data.completedSections ?? []),
      ])),
    };
    pendingProgress.current = payload;
    setProgressSaveState('saving');
    try {
      const result = await api.updateLessonProgress(courseId, lessonId, payload);
      if (!result.success) throw new Error('Progress was not saved');
      setCompletedSections(result.progress.completedSections);
      setIsCompleted(result.progress.isCompleted);
      pendingProgress.current = null;
      setProgressSaveState('saved');
      return true;
    } catch (error) {
      console.error('Progress update error:', error);
      setProgressSaveState('error');
      return false;
    } finally {
      savingProgress.current = false;
    }
  };

  const markSectionCompleted = async (section: TabKey, nextTab?: TabKey) => {
    const updated = Array.from(new Set([...completedSections, section]));
    const saved = await saveProgress({ completedSections: updated });
    if (saved && nextTab) {
      setActiveTab(nextTab);
      setTheaterMode(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuizOptionSelect = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const submitQuiz = async () => {
    if (!lesson || savingProgress.current || lesson.content.renshuu.length === 0) return;
    const questions = lesson.content.renshuu;
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    const updated = Array.from(new Set([...completedSections, 'renshuu']));
    await saveProgress({
      completedSections: updated,
      quizScore: score,
      isCompleted: score >= 70,
    });
  };

  const handleAskAiExplainer = async (
    qIdx: number,
    question: string,
    userAnswer: string,
    correctAnswer: string,
    existingExplanation?: string | null,
  ) => {
    setAiExplanations((prev) => ({
      ...prev,
      [qIdx]: { whyWrong: '', whyCorrect: '', tip: '', loading: true },
    }));
    try {
      const res = await api.explainMistake({
        question,
        userAnswer,
        correctAnswer,
        explanation: existingExplanation || undefined,
        level: lesson?.module?.courseTitle || 'N5',
      });
      setAiExplanations((prev) => ({
        ...prev,
        [qIdx]: { ...res, loading: false },
      }));
    } catch (e) {
      setAiExplanations((prev) => ({
        ...prev,
        [qIdx]: {
          whyWrong: 'AI bilan bogʻlanishda xatolik yuz berdi.',
          whyCorrect: `Toʻgʻri javob: "${correctAnswer}"`,
          tip: 'Qoidalarni qayta takrorlang.',
          loading: false,
        },
      }));
    }
  };

  const startKaiwa = () => {
    setKaiwaStarted(true);
    setKaiwaStep(1);
    setKaiwaSummary(null);
    setKaiwaRewardAwarded(null);

    const firstLine = lesson?.kaiwaScenario?.sampleDialog?.[0];
    const initialAiMsg = {
      sender: 'ai' as const,
      japanese: firstLine?.text || 'こんにちは！はじめまして。お名前は何ですか？',
      uzbek: firstLine?.uz || 'Salom! Tanishganimdan xursandman. Ismingiz nima?',
      romaji: 'Konnichiwa! Hajimemashite. Onamae wa nan desu ka?',
      encouragement: 'Suhbatni boshlash uchun yaponcha javob yozing!',
    };
    setKaiwaMessages([initialAiMsg]);
  };

  const sendKaiwa = async (textToSend?: string) => {
    const text = (textToSend ?? kaiwaInput).trim();
    if (!text || kaiwaLoading || kaiwaStep > 5) return;
    setKaiwaInput('');

    const newHistory = [
      ...kaiwaMessages,
      { sender: 'user' as const, japanese: text },
    ];
    setKaiwaMessages(newHistory);
    setKaiwaLoading(true);

    try {
      const res = await api.sendKaiwaMessage({
        lessonId,
        lessonTitle: lesson?.title,
        topic: lesson?.kaiwaScenario?.topic,
        goal: lesson?.kaiwaScenario?.goal,
        partnerName: lesson?.kaiwaScenario?.partnerName,
        kotobaWords: lesson?.content?.kotoba?.map((k) => k.word) || [],
        history: newHistory.map((m) => ({
          sender: m.sender,
          japanese: m.japanese,
          romaji: m.romaji,
          uzbek: m.uzbek,
        })),
        userMessage: text,
        step: kaiwaStep,
      });

      setKaiwaMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          japanese: res.japanese,
          romaji: res.romaji,
          uzbek: res.uzbek,
          correction: res.correction,
          encouragement: res.encouragement,
        },
      ]);

      if (res.isCompleted || kaiwaStep >= 5) {
        if (res.summary) {
          setKaiwaSummary(res.summary);
        }
        if (res.coinsAwarded) {
          setKaiwaRewardAwarded(res.coinsAwarded);
        }
        markSectionCompleted('kaiwa');
      } else {
        setKaiwaStep((s) => s + 1);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setKaiwaLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
  };

  const getResolvedVideoUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const [completing, setCompleting] = React.useState(false);

  const handleCompleteLesson = async () => {
    setCompleting(true);
    const allSections: TabKey[] = ['video', 'kotoba', 'bunpou', 'kanji', 'renshuu', 'kaiwa'];
    await saveProgress({ isCompleted: true, completedSections: allSections });
    setCompleting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        <p className="text-[14px] text-muted-foreground">Dars yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <div className="text-destructive font-semibold">{error || 'Dars topilmadi'}</div>
        <Link
          href={`/${lang}/dashboard/courses/${courseId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-[14px] font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kurs xaritasiga qaytish</span>
        </Link>
      </div>
    );
  }

  if (lesson.isLocked) {
    const isProLocked = lesson.lockReason === 'PRO_REQUIRED';
    const courseTitle = lesson.module?.courseTitle || 'Yapon tili kursi';
    const moduleTitle = lesson.module?.title || 'Modul';
    const lessonTitle = lesson.title || 'Dars';
    const lessonNumber = lesson.japaneseTitle || `${lesson.order}-dars`;

    return (
      <div className="max-w-xl mx-auto my-12 text-center space-y-6 animate-in fade-in p-6 sm:p-9 rounded-[32px] border border-border/80 bg-card shadow-xl">
        {/* Course & Module Context Breadcrumb */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border/60 text-xs font-semibold text-muted-foreground flex-wrap justify-center shadow-2xs">
          <span className="text-foreground font-bold">{courseTitle}</span>
          <span>›</span>
          <span className="text-foreground/80 truncate max-w-[200px]">{moduleTitle}</span>
          <span>›</span>
          <span className="text-primary font-black">{lessonNumber}</span>
        </div>

        {/* Lock Icon */}
        <div
          className={`grid h-16 w-16 mx-auto place-items-center rounded-3xl transition-transform hover:scale-105 ${
            isProLocked
              ? 'bg-yellow-500/15 text-yellow-500 ring-2 ring-yellow-500/30 shadow-inner'
              : 'bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/20'
          }`}
        >
          {isProLocked ? (
            <Crown className="h-8 w-8 stroke-[2.5]" />
          ) : (
            <Lock className="h-8 w-8 stroke-[2.5]" />
          )}
        </div>

        {/* Dynamic Title and Description */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {isProLocked ? 'Ushbu dars Pro aʼzolar uchun ochiq 👑' : 'Ushbu dars hozircha qulflangan 🔒'}
            </h2>
            <p className="text-sm font-bold text-primary font-japanese">
              {lessonNumber}: {lessonTitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {isProLocked
              ? `«${courseTitle}» kursidagi ushbu dars muallif tomonidan Pro tarifiga kiritilgan. Ushbu darsning barcha video tushuntirishlari, lugʻat (Kotoba), grammatika (Bunpou), Kanji hamda AI Sensei bilan cheksiz muloqot qilish uchun Pro obunani faollashtiring.`
              : `Yapon tilini samarali va bosqichma-bosqich oʻzlashtirish uchun darslar ketma-ketlikda oʻrganiladi. Ushbu darsga oʻtishdan oldin ${lesson.navigation?.prevLesson ? `«${lesson.navigation.prevLesson.title}»` : 'oldingi'} darsni yakunlashingiz kerak.`}
          </p>
        </div>

        {/* Features Checklist for Pro Locked Lessons */}
        {isProLocked && (
          <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 text-left space-y-2 text-xs">
            <p className="font-bold text-foreground mb-2 text-center text-[13px]">
              Pro Obuna bilan ushbu darsda nimalarga ega boʻlasiz?
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-foreground">Toʻliq video & audio darslik</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-foreground">Kotoba, Bunpou va Kanji</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-foreground">Renshuu interaktiv mashqlari</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-foreground">Cheksiz AI Sensei suhbati</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          {isProLocked ? (
            <Link
              href={`/${lang}/dashboard/premium`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 text-xs sm:text-sm font-black shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Crown className="h-4 w-4" />
              <span>Pro Obunani faollashtirish</span>
            </Link>
          ) : (
            lesson.navigation?.prevLesson && (
              <Link
                href={`/${lang}/dashboard/courses/${courseId}/lessons/${lesson.navigation.prevLesson.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-xs sm:text-sm font-bold shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Oldingi darsga oʻtish</span>
              </Link>
            )
          )}
          <Link
            href={`/${lang}/dashboard/courses/${courseId}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground px-5 py-3 text-xs sm:text-sm font-semibold border border-border/60 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kurs xaritasiga qaytish</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasVideo = !!lesson.videoUrl;
  const ytEmbed = getYouTubeEmbedUrl(lesson.videoUrl);
  const resolvedVideoSrc = getResolvedVideoUrl(lesson.videoUrl);

  const sidebarTabs: { key: TabKey; label: string; icon: any; count?: number }[] = [
    ...(hasVideo ? [{ key: 'video' as TabKey, label: 'Videodarslik', icon: Video }] : []),
    { key: 'kotoba', label: '1. Kotoba (Lugʻat)', icon: BookOpen, count: lesson.content.kotoba.length },
    { key: 'bunpou', label: '2. Bunpou (Grammatika)', icon: FileText, count: lesson.content.bunpou.length },
    { key: 'kanji', label: '3. Kanji (Iyerogliflar)', icon: PenTool, count: lesson.content.kanji.length },
    { key: 'renshuu', label: '4. Renshuu (Mashqlar)', icon: HelpCircle, count: lesson.content.renshuu.length },
    { key: 'kaiwa', label: '5. Kaiwa (AI Dialog)', icon: Bot },
  ];

  const getNextTabKey = (): TabKey | null => {
    const keys: TabKey[] = sidebarTabs.map((t) => t.key);
    const currentIndex = keys.indexOf(activeTab);
    if (currentIndex >= 0 && currentIndex < keys.length - 1) {
      return keys[currentIndex + 1];
    }
    return null;
  };

  const nextTabKey = getNextTabKey();

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 pb-28 ${theaterMode ? 'max-w-7xl' : 'max-w-[1240px]'} mx-auto transition-all`}>
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <Link
            href={`/${lang}/dashboard/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{lesson.module.courseTitle} • {lesson.module.title}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary font-japanese">
              {lesson.japaneseTitle || `${lesson.order}-dars`}
            </span>
            <h1 className="headline text-[20px] sm:text-[24px] font-bold text-foreground">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Prev / Next Lesson & Complete Button */}
        <div className="flex items-center gap-2">
          {lesson.navigation.prevLesson && (
            <Link
              href={`/${lang}/dashboard/courses/${courseId}/lessons/${lesson.navigation.prevLesson.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t?.lessonRoom?.prevLesson || 'Oldingi dars'}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleCompleteLesson}
            disabled={completing || progressSaveState === 'saving'}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer shadow-xs ${
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
            }`}
            title="Darsni toʻliq yakunlangan deb belgilash va keyingisini ochish"
          >
            <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
            <span>{isCompleted ? (t?.lessonRoom?.completed || 'Dars tugatilgan') : completing ? (t?.admin?.users?.submitting || 'Saqlanmoqda...') : (t?.lessonRoom?.completeAndContinue || 'Darsni tugatish')}</span>
          </button>

          {/* Yangi Qo'shilgan: Keyingi Dars Tugmasi */}
          {lesson.navigation.nextLesson && (
            <Link
              href={`/${lang}/dashboard/courses/${courseId}/lessons/${lesson.navigation.nextLesson.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              title="Keyingi darsga oʻtish"
            >
              <span className="hidden sm:inline">{t?.lessonRoom?.nextLesson || 'Keyingi dars'}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {(!theaterMode || progressSaveState === 'error') && (
        <div className="space-y-2">
          <KitsuneMessage
            state={lessonKitsuneState({ activeTab, submitted: quizSubmitted, score: quizScore, completed: isCompleted, saveState: progressSaveState })}
            messageKey={progressSaveState === 'error' ? 'saveError' : progressSaveState === 'saving' ? 'saving' : activeTab === 'renshuu' ? (quizSubmitted && quizScore !== null ? (quizScore >= 70 ? 'completed' : 'encouraging') : 'thinking') : isCompleted ? 'completed' : 'studying'}
            size="small"
            animate={progressSaveState === 'saved'}
            announce
          />
          {progressSaveState === 'error' && (
            <button
              type="button"
              onClick={() => { if (pendingProgress.current) void saveProgress(pendingProgress.current); }}
              className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80"
            >
              {t.kitsune.retry}
            </button>
          )}
        </div>
      )}

      {/* MAIN CONTAINER: CONTENT AREA + RIGHT SIDEBAR */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT / CENTER CONTENT AREA */}
        <div className="flex-1 w-full min-w-0 space-y-6">

          {/* 1. VIDEODARSLIK CONTAINER */}
          {activeTab === 'video' && hasVideo && (
            <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-md">
              <div className="flex items-center justify-between p-3.5 bg-secondary/50 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Video className="h-4 w-4" />
                  </div>
                  <span className="text-[13px] font-bold text-foreground">
                    Videodarslik (Video Maʼruza)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTheaterMode(!theaterMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                    title={theaterMode ? 'Kichik ekran' : 'Katta ekran'}
                  >
                    {theaterMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    <span>{theaterMode ? 'Normal rejim' : 'Katta rejim'}</span>
                  </button>
                </div>
              </div>

              <div className="relative aspect-video w-full bg-black">
                {ytEmbed ? (
                  <iframe
                    src={ytEmbed}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : resolvedVideoSrc ? (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    src={resolvedVideoSrc}
                    className="w-full h-full object-contain"
                  >
                    Brauzeringiz ushbu videoni qoʻllab-quvvatlamaydi.
                  </video>
                ) : null}
              </div>
            </div>
          )}

          {/* 2. TAB 1: KOTOBA (LUG'AT) */}
          {activeTab === 'kotoba' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setKotobaViewMode('flashcard')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer ${
                      kotobaViewMode === 'flashcard' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    Flashcard rejimi
                  </button>
                  <button
                    type="button"
                    onClick={() => setKotobaViewMode('list')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer ${
                      kotobaViewMode === 'list' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    Roʻyxat ({lesson.content.kotoba.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFurigana(!showFurigana)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showFurigana ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>Furigana: {showFurigana ? 'Yoqilgan' : 'Oʻchirilgan'}</span>
                </button>
              </div>

              {kotobaViewMode === 'flashcard' && lesson.content.kotoba.length > 0 && (
                <div className="max-w-md mx-auto space-y-6">
                  {(() => {
                    const item = lesson.content.kotoba[flashcardIndex];
                    return (
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="relative cursor-pointer min-h-[320px] rounded-3xl border-2 border-border/80 bg-card p-8 shadow-xl flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-primary/40 select-none"
                      >
                        <div className="w-full flex items-center justify-between text-[12px] text-muted-foreground font-semibold">
                          <span className="rounded-lg bg-secondary px-2.5 py-1">
                            {item.partOfSpeech || 'Soʻz'}
                          </span>
                          <span>{flashcardIndex + 1} / {lesson.content.kotoba.length}</span>
                        </div>

                        {!isFlipped ? (
                          <div className="space-y-4 my-auto">
                            {showFurigana && item.furigana && item.furigana !== item.word && (
                              <div className="text-[15px] font-medium text-primary tracking-widest font-japanese">
                                {item.furigana}
                              </div>
                            )}
                            <div className="text-[44px] font-bold text-foreground tracking-wide font-japanese">
                              {item.word}
                            </div>
                            {item.romaji && (
                              <div className="text-[15px] text-muted-foreground font-mono">
                                {item.romaji}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 my-auto animate-in fade-in zoom-in-95">
                            <div className="text-[26px] font-bold text-foreground">
                              {item.meaningUz}
                            </div>
                            {item.sampleSentence && (
                              <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50 text-left space-y-1">
                                <p className="text-[14px] font-semibold text-foreground font-japanese">
                                  {item.sampleSentence}
                                </p>
                                {item.sampleSentenceUz && (
                                  <p className="text-[12px] text-muted-foreground">
                                    {item.sampleSentenceUz}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="w-full flex items-center justify-between pt-4 border-t border-border/60">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playJapaneseAudio(item.word);
                            }}
                            className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                            title="Talaffuzni tinglash"
                          >
                            <Volume2 className="h-5 w-5" />
                          </button>

                          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <RotateCw className="h-3 w-3" />
                            Aylantirish uchun bosing
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={flashcardIndex === 0}
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary text-[13px] font-bold text-foreground disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Oldingisi</span>
                    </button>
                    <button
                      type="button"
                      disabled={flashcardIndex === lesson.content.kotoba.length - 1}
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => Math.min(lesson.content.kotoba.length - 1, prev + 1));
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white text-[13px] font-bold shadow-md hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
                    >
                      <span>Keyingisi</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {kotobaViewMode === 'list' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {lesson.content.kotoba.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          {showFurigana && item.furigana && item.furigana !== item.word && (
                            <span className="text-[12px] text-primary font-medium font-japanese">{item.furigana}</span>
                          )}
                          <h4 className="text-[20px] font-bold text-foreground font-japanese">{item.word}</h4>
                          {item.romaji && <span className="text-[12px] text-muted-foreground font-mono">{item.romaji}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => playJapaneseAudio(item.word)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="border-t border-border/60 pt-2">
                        <p className="text-[14px] font-semibold text-foreground">{item.meaningUz}</p>
                        {item.sampleSentence && (
                          <p className="text-[12px] text-muted-foreground mt-1 font-japanese">
                            {item.sampleSentence} — <span className="text-[11px] font-sans">{item.sampleSentenceUz}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. TAB 2: BUNPOU (GRAMMATIKA) */}
          {activeTab === 'bunpou' && (
            <div className="space-y-8">
              {lesson.content.bunpou.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <h3 className="headline text-[18px] sm:text-[22px] font-bold text-foreground">
                      {item.title}
                    </h3>
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                      {idx + 1}-Qoida
                    </span>
                  </div>

                  {item.structure && (
                    <div className="rounded-2xl bg-secondary/70 p-4 border border-border flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Grammatik formula:</div>
                        <div className="text-[16px] font-bold text-primary mt-0.5 font-japanese">{item.structure}</div>
                      </div>
                    </div>
                  )}

                  <div className="text-[14px] sm:text-[15px] leading-relaxed text-foreground/90 space-y-2">
                    <p>{item.explanationUz}</p>
                  </div>

                  {item.examples && Array.isArray(item.examples) && item.examples.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                        Namunaviy jumlalar (Reibun):
                      </div>
                      <div className="space-y-2.5">
                        {item.examples.map((ex: any, eIdx: number) => (
                          <div
                            key={eIdx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="text-[15px] font-bold text-foreground font-japanese">
                                {ex.japanese}
                              </div>
                              {ex.romaji && (
                                <div className="text-[12px] text-muted-foreground font-mono">
                                  {ex.romaji}
                                </div>
                              )}
                              <div className="text-[13px] font-medium text-primary">
                                {ex.uzbek}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => playJapaneseAudio(ex.japanese)}
                              className="self-end sm:self-auto grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 4. TAB 3: KANJI (IYEROGLIFLAR) */}
          {activeTab === 'kanji' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {lesson.content.kanji.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/10 border border-primary/20 text-[48px] font-bold text-foreground font-japanese select-none">
                          {item.character}
                        </div>
                        <div>
                          <h4 className="text-[18px] font-bold text-foreground">{item.meaningUz}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {item.strokeCount && (
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                {item.strokeCount} ta chiziq
                              </span>
                            )}
                            {item.radical && (
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground font-japanese">
                                Ildiz: {item.radical}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => playJapaneseAudio(item.character)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[13px] bg-secondary/40 p-3 rounded-2xl border border-border/50">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground">Onʼyomi (Xitoycha):</span>
                        <span className="font-semibold text-foreground font-japanese">{item.onyomi || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground">Kunʼyomi (Yaponcha):</span>
                        <span className="font-semibold text-foreground font-japanese">{item.kunyomi || '—'}</span>
                      </div>
                    </div>

                    {item.examples && Array.isArray(item.examples) && item.examples.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <div className="text-[11px] font-bold uppercase text-muted-foreground">Birikmalar va soʻzlar:</div>
                        <div className="space-y-1.5">
                          {item.examples.map((ex: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-[13px] py-1">
                              <span className="font-bold text-foreground font-japanese">{ex.word} ({ex.reading})</span>
                              <span className="text-muted-foreground">{ex.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. TAB 4: RENSHUU (MASHQLAR) */}
          {activeTab === 'renshuu' && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="headline text-[20px] font-bold text-foreground">
                      Dars Mashqlari va Sinov
                    </h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Darsni toʻliq yakunlash uchun testni 70% dan yuqori ball bilan topshiring.
                    </p>
                  </div>
                  {quizScore !== null && (
                    <div className={`px-3 py-1.5 rounded-xl font-bold text-[14px] ${
                      quizScore >= 70 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/15 text-destructive'
                    }`}>
                      Natija: {quizScore}%
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {lesson.content.renshuu.map((q, qIdx) => {
                    const selected = quizAnswers[qIdx];
                    const isCorrect = selected === q.correctAnswer;

                    return (
                      <div key={q.id} className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-[12px] mt-0.5">
                              {qIdx + 1}
                            </span>
                            <div className="font-semibold text-foreground whitespace-pre-line text-[15px]">
                              {q.question}
                            </div>
                          </div>
                          {q.type === 'AUDIO_LISTENING' && (
                            <button
                              type="button"
                              onClick={() => playJapaneseAudio(q.question)}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-2 pl-8">
                          {q.options && Array.isArray(q.options) && q.options.map((opt: string, optIdx: number) => {
                            const isThisSelected = selected === opt;
                            const showFeedback = quizSubmitted;
                            const isThisCorrect = opt === q.correctAnswer;

                            let style = 'border-border bg-secondary/40 text-foreground hover:bg-secondary';
                            if (isThisSelected) {
                              style = 'border-primary bg-primary/15 text-primary font-bold';
                            }
                            if (showFeedback) {
                              if (isThisCorrect) {
                                style = 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold';
                              } else if (isThisSelected && !isThisCorrect) {
                                style = 'border-destructive bg-destructive/20 text-destructive font-bold';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => handleQuizOptionSelect(qIdx, opt)}
                                className={`w-full text-left p-3 rounded-xl border text-[14px] transition-all flex items-center justify-between cursor-pointer ${style}`}
                              >
                                <span>{opt}</span>
                                {showFeedback && isThisCorrect && (
                                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                )}
                                {showFeedback && isThisSelected && !isThisCorrect && (
                                  <X className="h-4 w-4 text-destructive shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <div className="ml-8 p-3 rounded-xl bg-secondary/70 text-[12px] text-muted-foreground leading-relaxed">
                            <strong>Tushuntirish:</strong> {q.explanation}
                          </div>
                        )}

                        {/* AI Explainer button when answer is wrong */}
                        {quizSubmitted && selected && selected !== q.correctAnswer && (
                          <div className="ml-8 space-y-2">
                            {!aiExplanations[qIdx] ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAskAiExplainer(
                                    qIdx,
                                    q.question,
                                    selected,
                                    q.correctAnswer,
                                    q.explanation
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold cursor-pointer transition-colors"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>💡 Nega bu javob xato? (AI Senseidan soʻrash)</span>
                              </button>
                            ) : aiExplanations[qIdx].loading ? (
                              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 animate-spin" />
                                <span>AI Sensei xatoni tahlil qilmoqda...</span>
                              </div>
                            ) : (
                              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-xs space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                                  <Sparkles className="h-4 w-4" />
                                  <span>AI Sensei Tushuntirishi:</span>
                                </div>
                                <div className="text-foreground/90 space-y-1 leading-relaxed">
                                  <p>
                                    <span className="font-semibold text-destructive">Nega xato: </span>
                                    {aiExplanations[qIdx].whyWrong}
                                  </p>
                                  <p>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Toʻgʻri javob qoidasi: </span>
                                    {aiExplanations[qIdx].whyCorrect}
                                  </p>
                                  <p>
                                    <span className="font-semibold text-primary">Maslahat: </span>
                                    {aiExplanations[qIdx].tip}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  {quizSubmitted ? (
                    <button
                      type="button"
                      disabled={progressSaveState === 'saving'}
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                        setQuizScore(null);
                        setProgressSaveState('idle');
                        pendingProgress.current = null;
                      }}
                      className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-secondary cursor-pointer"
                    >
                      Qayta topshirish
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length < lesson.content.renshuu.length}
                      onClick={submitQuiz}
                      className="w-full py-3 rounded-2xl bg-[#0071e3] text-white font-bold text-[14px] shadow-lg hover:bg-[#0077ed] disabled:opacity-50 transition-all cursor-pointer"
                    >
                      Natijalarni tekshirish va darsni yakunlash
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. TAB 5: KAIWA (AI DIALOG) */}
          {activeTab === 'kaiwa' && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        AI Speaking Sensei
                      </span>
                      <span className="text-[11px] text-muted-foreground">2–5 daqiqalik muloqot</span>
                    </div>
                    <h3 className="headline text-[20px] font-bold text-foreground mt-0.5">
                      {lesson.kaiwaScenario?.topic || 'Dars mavzusiga mos interaktiv suhbat'}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 bg-secondary/40 p-4 rounded-2xl border border-border/50">
                  <div className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider">Suhbat maqsadi:</div>
                  <p className="text-[14px] text-foreground leading-relaxed">
                    {lesson.kaiwaScenario?.goal || 'Oʻzingizning ismingiz, kasbingiz va qayerdan ekanligingizni aytib suhbatdosh bilan tanishing.'}
                  </p>
                </div>

                {lesson.kaiwaScenario?.sampleDialog && (
                  <div className="space-y-3">
                    <div className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider">
                      Namunaviy dialog:
                    </div>
                    <div className="space-y-3">
                      {lesson.kaiwaScenario.sampleDialog.map((line: any, lIdx: number) => (
                        <div key={lIdx} className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-primary">{line.speaker}:</span>
                            <button
                              type="button"
                              onClick={() => playJapaneseAudio(line.text)}
                              className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-[15px] font-bold text-foreground font-japanese">{line.text}</p>
                          <p className="text-[12px] text-muted-foreground">{line.uz}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive AI Chat Workspace */}
                {!kaiwaStarted ? (
                  <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-card p-6 sm:p-8 border border-purple-500/20 text-center space-y-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg mx-auto">
                      <Sparkles className="h-8 w-8 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-lg sm:text-xl">
                        AI Sensei bilan dars boʻyicha 5-qadamli muloqot
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Darsda oʻrgangan grammatika va soʻzlaringizni tekshiring. Har bir javobingiz tahlil qilinadi, xatolar tuzatiladi va yakunida sizga <strong>+20 tanga</strong> mukofot beriladi!
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={startKaiwa}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <Bot className="h-4 w-4" />
                        <span>Suhbatni boshlash (1/5 qadam)</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header Progress Bar */}
                    <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                          <Bot className="h-4 w-4" />
                          <span>AI Sensei Muloqoti</span>
                        </span>
                        <span className="text-muted-foreground">
                          {kaiwaSummary ? 'Yakunlandi 🎉' : `Qadam ${kaiwaStep} / 5`}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                          style={{
                            width: kaiwaSummary ? '100%' : `${(kaiwaStep / 5) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Messages Flow */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {kaiwaMessages.map((msg, mIdx) => {
                        const isAi = msg.sender === 'ai';

                        return (
                          <div
                            key={mIdx}
                            className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                          >
                            {isAi && (
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs mt-1">
                                <Bot className="h-5 w-5" />
                              </div>
                            )}

                            <div
                              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 text-sm ${
                                isAi
                                  ? 'bg-secondary/40 border border-border text-foreground'
                                  : 'bg-primary text-primary-foreground font-japanese text-[15px]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isAi ? 'text-purple-600 dark:text-purple-400' : 'text-primary-foreground/80'}`}>
                                  {isAi ? 'Sensei' : 'Siz'}
                                </span>
                                {isAi && (
                                  <button
                                    type="button"
                                    onClick={() => playJapaneseAudio(msg.japanese)}
                                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              <p className={`font-semibold ${isAi ? 'font-japanese text-[16px]' : ''}`}>
                                {msg.japanese}
                              </p>

                              {isAi && msg.romaji && (
                                <p className="text-xs font-mono text-muted-foreground">
                                  {msg.romaji}
                                </p>
                              )}

                              {isAi && msg.uzbek && (
                                <p className="text-xs text-muted-foreground/90 pt-1 border-t border-border/40">
                                  {msg.uzbek}
                                </p>
                              )}

                              {/* Correction Badge */}
                              {msg.correction && (
                                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                  <strong>⚠️ Maslahat:</strong> {msg.correction}
                                </div>
                              )}

                              {/* Encouragement Badge */}
                              {msg.encouragement && (
                                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ✨ {msg.encouragement}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {kaiwaLoading && (
                        <div className="flex gap-3 items-center text-xs text-purple-600 dark:text-purple-400 py-2">
                          <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-600/10">
                            <Sparkles className="h-4 w-4 animate-spin" />
                          </div>
                          <span>Sensei javob bermoqda...</span>
                        </div>
                      )}
                    </div>

                    {/* Celebration / Summary Card */}
                    {kaiwaSummary ? (
                      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 sm:p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Dars muloqoti muvaffaqiyatli yakunlandi!</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-center">
                          <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                            <div className="text-xl font-bold text-foreground">
                              {kaiwaSummary.accuracyPercent}%
                            </div>
                            <div className="text-[11px] text-muted-foreground">Aniq javoblar</div>
                          </div>
                          <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                            <div className="text-xl font-bold text-foreground">
                              {kaiwaSummary.wordsUsedCount} ta
                            </div>
                            <div className="text-[11px] text-muted-foreground">Yangi soʻzlar</div>
                          </div>
                          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 col-span-2 sm:col-span-1">
                            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                              +{kaiwaRewardAwarded || kaiwaSummary.rewardCoins || 20} 🪙
                            </div>
                            <div className="text-[11px] text-muted-foreground">Tanga berildi!</div>
                          </div>
                        </div>

                        <p className="text-sm text-foreground/90 max-w-md mx-auto leading-relaxed">
                          {kaiwaSummary.feedback}
                        </p>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={startKaiwa}
                            className="px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
                          >
                            Qaytadan mashq qilish
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* User Input Box */
                      <div className="space-y-3 pt-2">
                        {/* Quick prompt hints from lesson */}
                        {lesson?.content?.kotoba && lesson.content.kotoba.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] text-muted-foreground font-medium">
                              Yordamchi soʻzlar (bosib kiriting):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {lesson.content.kotoba.slice(0, 6).map((k) => (
                                <button
                                  key={k.id}
                                  type="button"
                                  onClick={() =>
                                    setKaiwaInput((prev) => (prev ? `${prev} ${k.word}` : k.word))
                                  }
                                  className="text-xs px-2.5 py-1 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                  {k.word} ({k.meaningUz})
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={kaiwaInput}
                            onChange={(e) => setKaiwaInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                sendKaiwa();
                              }
                            }}
                            placeholder="Yaponcha javobingizni yozing (masalan: はい、学生です)..."
                            disabled={kaiwaLoading}
                            className="flex-1 rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm sm:text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-purple-500 focus:bg-card focus:ring-2 focus:ring-purple-500/10"
                          />
                          <button
                            type="button"
                            onClick={() => sendKaiwa()}
                            disabled={kaiwaLoading || !kaiwaInput.trim()}
                            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            {kaiwaLoading ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Yuborish</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ENG PASTIDA KEYINGISI TUGMASI (BOTTOM NAVIGATION BAR) */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[13px] text-muted-foreground font-medium">
              Hozirgi boʻlim: <span className="text-foreground font-bold">{sidebarTabs.find((t) => t.key === activeTab)?.label}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {nextTabKey ? (
                <button
                  type="button"
                  onClick={() => {
                    markSectionCompleted(activeTab, nextTabKey);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0071e3] text-white font-bold text-[14px] shadow-lg hover:bg-[#0077ed] transition-all cursor-pointer"
                >
                  <span>Keyingisi ({sidebarTabs.find((t) => t.key === nextTabKey)?.label})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : lesson.navigation.nextLesson ? (
                <Link
                  href={`/${lang}/dashboard/courses/${courseId}/lessons/${lesson.navigation.nextLesson.id}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-[14px] shadow-lg hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <span>Keyingi darsga oʻtish</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={`/${lang}/dashboard/courses/${courseId}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-[14px] shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Darslikni yakunlash</span>
                </Link>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR
          Theater mode bo'lganda kengligi qisqarib (lg:w-[80px]) ikonka formatga tushadi. 
          Boshqa payt aslo yopilmaydi.
        */}
        <aside className={`shrink-0 transition-all duration-300 ${theaterMode ? 'w-full lg:w-[80px]' : 'w-full lg:w-72'}`}>
          <div className="rounded-3xl border border-border bg-card p-4 space-y-3 sticky top-6 shadow-sm">
            <div className={`flex items-center ${theaterMode ? 'lg:justify-center justify-between' : 'justify-between'} border-b border-border/60 pb-3`}>
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4 text-primary" />
                <h3 className={`text-[14px] font-bold text-foreground ${theaterMode ? 'lg:hidden' : ''}`}>
                  Dars boʻlimlari
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              {sidebarTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                const isTabDone = completedSections.includes(t.key);

                return (
                  <button
                    key={t.key}
                    type="button"
                    title={theaterMode ? t.label : undefined}
                    onClick={() => {
                      setActiveTab(t.key);
                      setTheaterMode(false); // Boshqa bo'limga o'tganda video rejimidan avtomatik chiqish
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`relative flex items-center transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : isTabDone
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    } ${
                      theaterMode
                        ? 'w-full justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold lg:justify-center lg:w-12 lg:h-12 lg:mx-auto lg:rounded-2xl lg:px-0 lg:py-0'
                        : 'w-full justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 ${theaterMode ? 'lg:scale-110' : ''}`} />
                      <span className={theaterMode ? 'lg:hidden' : ''}>{t.label}</span>
                    </div>
                    {isTabDone && !isActive && (
                      <>
                        <Check className={`h-3.5 w-3.5 stroke-[3] text-emerald-600 dark:text-emerald-400 shrink-0 ${theaterMode ? 'lg:hidden' : ''}`} />
                        {/* Mini rejimda checkbox o'rniga yashil nuqta */}
                        <span className={`absolute top-1 right-1 h-2.5 w-2.5 border-2 border-card rounded-full bg-emerald-500 hidden ${theaterMode ? 'lg:block' : ''}`} />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
