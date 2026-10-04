'use client';

import { KitsuneMessage } from '@/components/kitsune/kitsune-message';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Flag,
  HelpCircle,
  LayoutGrid,
  Send,
  Loader2,
  Check,
  ChevronRight,
  Headphones,
  FastForward,
  BookOpen,
  FileCheck2,
  X,
} from 'lucide-react';
import { api, JlptTestDetail, TestSubmitResponse } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { TestResultsView } from '@/components/dashboard/tests/test-results-view';
import { getMediaUrl } from '@/components/shared/user-avatar';

export default function TestRunnerPage() {
  const { lang, t } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [test, setTest] = React.useState<JlptTestDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Exam state
  const [userAnswers, setUserAnswers] = React.useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = React.useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [timeSpent, setTimeSpent] = React.useState<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitResult, setSubmitResult] = React.useState<TestSubmitResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showNavigator, setShowNavigator] = React.useState(false);

  // Barchasi olib tashlandi, default holat 1-modul
  const [activeModule, setActiveModule] = React.useState<
    'MODULE_1_VOCAB' | 'MODULE_2_GRAMMAR_READING' | 'MODULE_3_LISTENING'
  >('MODULE_1_VOCAB');

  // Continuous Audio Player state for Choukai
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);

  // Boshqa modulga o'tganda audioni to'xtatish
  React.useEffect(() => {
    if (activeModule !== 'MODULE_3_LISTENING' && audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [activeModule, isPlaying]);

  // Derived calculations
  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = test?.questions?.length || 0;
  const unansweredCount = totalCount - answeredCount;
  const progressPercent =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const moduleCounts = React.useMemo(() => {
    if (!test?.questions) return { m1: 0, m2: 0, m3: 0 };
    let m1 = 0,
      m2 = 0,
      m3 = 0;
    for (const q of test.questions) {
      if (q.section === 'MODULE_1_VOCAB' || q.section === 'KOTOBA') m1++;
      else if (
        q.section === 'MODULE_2_GRAMMAR_READING' ||
        q.section === 'BUNPOU' ||
        q.section === 'DOKKAI'
      )
        m2++;
      else if (q.section === 'MODULE_3_LISTENING' || q.section === 'CHOUKAI')
        m3++;
    }
    return { m1, m2, m3 };
  }, [test?.questions]);

  // Faqat aktiv modul savollari
  const displayedQuestions = React.useMemo(() => {
    if (!test?.questions) return [];
    return test.questions.filter((q) => {
      if (activeModule === 'MODULE_1_VOCAB')
        return q.section === 'MODULE_1_VOCAB' || q.section === 'KOTOBA';
      if (activeModule === 'MODULE_2_GRAMMAR_READING')
        return (
          q.section === 'MODULE_2_GRAMMAR_READING' ||
          q.section === 'BUNPOU' ||
          q.section === 'DOKKAI'
        );
      if (activeModule === 'MODULE_3_LISTENING')
        return q.section === 'MODULE_3_LISTENING' || q.section === 'CHOUKAI';
      return false;
    });
  }, [test?.questions, activeModule]);

  // 1. Fetch test
  const loadTest = React.useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJlptTestBySlug(slug);
      setTest(data);
      setTimeLeft(data.durationMinutes * 60);
    } catch (err: any) {
      setError(err?.message || 'Testni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    loadTest();
  }, [loadTest]);

  // 2. Countdown Timer
  React.useEffect(() => {
    if (!test || submitResult || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [test, submitResult, timeLeft]);

  // 3. Audio Handlers
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setAudioCurrentTime(target);
    }
  };

  const toggleMuteAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cyclePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 0.75 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // 4. Question Answers & Flags
  const handleSelectAnswer = (questionId: string, option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Xaritadan savol ustiga bosilganda boshqa modulda bo'lsa o'tkazish
  const scrollToQuestion = (questionId: string) => {
    setShowNavigator(false);
    const targetQ = test?.questions?.find(q => q.id === questionId);
    
    if (targetQ) {
      const sec = targetQ.section;
      if (sec === 'MODULE_1_VOCAB' || sec === 'KOTOBA') {
        setActiveModule('MODULE_1_VOCAB');
      } else if (sec === 'MODULE_2_GRAMMAR_READING' || sec === 'BUNPOU' || sec === 'DOKKAI') {
        setActiveModule('MODULE_2_GRAMMAR_READING');
      } else if (sec === 'MODULE_3_LISTENING' || sec === 'CHOUKAI') {
        setActiveModule('MODULE_3_LISTENING');
      }

      // Kichik kechikish moduli render bo'lishini kutish uchun
      setTimeout(() => {
        const el = document.getElementById(`question-${questionId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // 5. Submit test
  const executeSubmit = async () => {
    if (!test) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const answersArray = Object.entries(userAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }));

      const res = await api.submitJlptTest(test.id, {
        answers: answersArray,
        timeSpentSeconds: timeSpent,
      });

      setSubmitResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err?.message || 'Testni topshirishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    executeSubmit();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatAudioTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Savollar xaritasi komponenti (Takrorlanmaslik uchun funksiya)
  const renderQuestionMap = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 pb-3 border-b border-border/50">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span>Savollar xaritasi</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" /> Belgilangan
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-secondary border border-border/80" /> Belgilanmagan
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Bayroq
          </span>
        </div>
      </div>
      <div className="grid grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[50vh] lg:max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin pr-1">
        {test?.questions?.map((q) => {
          const isAnswered = !!userAnswers[q.id];
          const isFlagged = !!flaggedQuestions[q.id];

          let bgClass = 'border-border/60 bg-secondary/30 text-muted-foreground';
          if (isAnswered) {
            bgClass = 'border-primary bg-primary text-primary-foreground shadow-xs font-bold';
          }
          if (isFlagged) {
            bgClass += ' ring-2 ring-amber-500';
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => scrollToQuestion(q.id)}
              className={`h-9 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 ${bgClass}`}
            >
              {q.questionNumber}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          JLPT Test maʼlumotlari yuklanmoqda...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !test) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-3xl border border-destructive/30 bg-destructive/5 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-base font-bold text-foreground">Xatolik</h2>
        <p className="text-xs text-muted-foreground">{error || 'Test topilmadi'}</p>
        <Link
          href={`/${lang}/dashboard/tests`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Testlar roʻyxatiga qaytish
        </Link>
      </div>
    );
  }

  // If already submitted -> Show Results View
  if (submitResult) {
    return (
      <TestResultsView
        result={submitResult}
        onRetake={() => {
          setSubmitResult(null);
          setUserAnswers({});
          setFlaggedQuestions({});
          setTimeSpent(0);
          setTimeLeft(test.durationMinutes * 60);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-6 lg:gap-8 pb-28 relative">
      
      {/* Hidden Audio Element */}
      {test.audioUrl && (
        <audio
          ref={audioRef}
          src={getMediaUrl(test.audioUrl)}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          preload="auto"
        />
      )}

      {/* Main Left Content */}
      <div className="flex-1 w-full lg:max-w-[calc(100%-320px)] xl:max-w-[calc(100%-350px)] space-y-6">
        
        {/* Top Floating / Sticky Exam Header (Asosiy navbar ostida bo'lishi uchun z-30 va top-[75px]) */}
        <div className="sticky top-[75px] z-30 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-3.5 sm:p-4 shadow-lg transition-all space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Back & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href={`/${lang}/dashboard/tests`}
                className="h-8 w-8 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-all"
                title="Chiqish"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black shrink-0">
                    {test.level}
                  </span>
                  <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {test.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Timer & Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Timer Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-colors ${
                  timeLeft <= 180
                    ? 'border-destructive bg-destructive/10 text-destructive animate-pulse'
                    : timeLeft <= 600
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                    : 'border-border/60 bg-secondary/40 text-foreground'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTimer(timeLeft)}</span>
              </div>

              {/* Questions Grid Button - Faqat mobilda */}
              <button
                type="button"
                onClick={() => setShowNavigator(true)}
                className="lg:hidden h-8 px-2.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-muted-foreground font-mono">
                  {answeredCount}/{totalCount}
                </span>
              </button>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <KitsuneMessage state="studying" variant="expression" level={test.level} messageKey="testing" size="small" />

        {/* CONTINUOUS FLOATING AUDIO BAR FOR CHOUKAI (Faqat Choukaida chiqadi) */}
        {test.audioUrl && activeModule === 'MODULE_3_LISTENING' && (
          <div className="sticky top-[145px] z-20 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-r from-blue-900/30 via-card to-card p-3.5 sm:p-4 shadow-xl backdrop-blur-xl space-y-2 animate-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? 'Pauza' : 'Eshitishni boshlash'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                      <Headphones className="h-3 w-3 animate-pulse" />
                      Choukai Audio
                    </span>
                    {isPlaying && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Audioni qoʻying va pastga tushib javob bering
                  </p>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  type="button"
                  onClick={cyclePlaybackRate}
                  className="px-2 py-1 rounded-lg border border-border/60 bg-secondary/40 text-[11px] font-mono font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                  title="Ijro tezligi"
                >
                  {playbackRate}x
                </button>

                <button
                  type="button"
                  onClick={toggleMuteAudio}
                  className="h-8 w-8 rounded-lg border border-border/60 bg-secondary/30 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <span className="text-xs font-mono font-bold text-foreground shrink-0">
                  {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
                </span>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={audioDuration || 100}
                value={audioCurrentTime}
                onChange={handleSeekAudio}
                className="w-full h-1.5 rounded-lg bg-secondary/60 appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 3 OFFICIAL JLPT MODULES TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveModule('MODULE_1_VOCAB')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
              activeModule === 'MODULE_1_VOCAB'
                ? 'bg-blue-600 text-white shadow-md'
                : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{t?.examRoom?.section1 || '1-Modul: 文字・語彙'} ({moduleCounts.m1})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('MODULE_2_GRAMMAR_READING')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
              activeModule === 'MODULE_2_GRAMMAR_READING'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>{t?.examRoom?.section2 || '2-Modul: 文法・読解'} ({moduleCounts.m2})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('MODULE_3_LISTENING')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
              activeModule === 'MODULE_3_LISTENING'
                ? 'bg-purple-600 text-white shadow-md'
                : 'border border-border/60 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>{t?.examRoom?.section3 || '3-Modul: 聴解 Audio'} ({moduleCounts.m3})</span>
          </button>
        </div>

        {/* Questions Flow */}
        <div className="space-y-6">
          {displayedQuestions.map((q) => {
            const selected = userAnswers[q.id];
            const isFlagged = flaggedQuestions[q.id];

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="rounded-3xl border border-border/60 bg-card p-5 sm:p-7 shadow-xs space-y-5 transition-all hover:border-border"
              >
                {/* Mondai Header */}
                {q.mondaiTitle && (
                  <div className="p-3 rounded-2xl bg-secondary/30 border border-border/40 text-xs font-semibold text-foreground/90">
                    {q.mondaiTitle}
                  </div>
                )}

                {/* Question Number & Flag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-extrabold">
                      № {q.questionNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {q.section} ({q.points} ball)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFlagQuestion(q.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isFlagged
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                        : 'border-border/60 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                    title="Keyinroqqa qoldirish"
                  >
                    <Flag className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {isFlagged ? 'Belgilangan' : 'Bayroqcha'}
                    </span>
                  </button>
                </div>

                {/* Context Text */}
                {q.contextText && (
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50 text-xs sm:text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">
                    {q.contextText}
                  </div>
                )}

                {/* Question Text */}
                <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                  {q.questionText}
                </h2>

                {/* 4 Interactive Options */}
                <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                  {q.options?.map((opt, optIdx) => {
                    const isSelected = selected === opt;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, opt)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer group active:scale-98 ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-border/60 bg-secondary/20 hover:bg-secondary/50 hover:border-primary/40 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-card border border-border/60 text-muted-foreground group-hover:border-primary/40'
                            }`}
                          >
                            {optIdx + 1}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>

                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modul oxiridagi "Keyingisi" navigatsiyasi */}
        <div className="pt-8 pb-4 flex justify-end">
          {activeModule === 'MODULE_1_VOCAB' && (
            <button
              onClick={() => {
                setActiveModule('MODULE_2_GRAMMAR_READING');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border/60 text-sm font-bold text-foreground transition-all shadow-sm"
            >
              Keyingisi: 2-Modul <ChevronRight className="h-4 w-4" />
            </button>
          )}
          
          {activeModule === 'MODULE_2_GRAMMAR_READING' && (
            <button
              onClick={() => {
                setActiveModule('MODULE_3_LISTENING');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border/60 text-sm font-bold text-foreground transition-all shadow-sm"
            >
              Keyingisi: 3-Modul (Choukai) <ChevronRight className="h-4 w-4" />
            </button>
          )}
          
          {activeModule === 'MODULE_3_LISTENING' && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-sm font-bold text-primary-foreground transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" /> Testni yakunlash
            </button>
          )}
        </div>
      </div>

      {/* Right Column (Map) - Faqat Kompyuterda ko'rinadi */}
      <div className="hidden lg:block lg:w-[320px] xl:w-[350px] shrink-0">
        <div className="sticky top-[75px] z-20 rounded-2xl border border-border/80 bg-card p-5 shadow-lg">
          {renderQuestionMap()}
        </div>
      </div>

      {/* Mobile Right Drawer (Kichik ekranlarda ochiluvchi menyu) */}
      {showNavigator && (
        <div className="fixed inset-0 z-[60] flex justify-end lg:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowNavigator(false)} 
          />
          <div className="relative w-[85%] max-w-[320px] h-full bg-card border-l border-border/80 p-5 shadow-2xl animate-in slide-in-from-right flex flex-col">
            <button
              onClick={() => setShowNavigator(false)}
              className="absolute top-4 right-4 h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mt-8">
              {renderQuestionMap()}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-3 inset-x-0 z-40 max-w-sm lg:max-w-md mx-auto px-4">
        <div className="flex items-center justify-between p-3 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-semibold text-foreground">
              {answeredCount}/{totalCount} ta
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <span>Yakunlash</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Testni yakunlaysizmi?
              </h3>
              <p className="text-xs text-muted-foreground">
                Javoblaringiz tekshiriladi va yakuniy ball hisoblanadi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jami savollar:</span>
                <span className="font-bold text-foreground">{totalCount} ta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Belgilangan javoblar:</span>
                <span className="font-bold text-emerald-500">{answeredCount} ta</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex items-center justify-between text-destructive">
                  <span>Belgilanmagan savollar:</span>
                  <span className="font-bold">{unansweredCount} ta (0 ball)</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Diqqat: {unansweredCount} ta savolga javob berilmadi. Belgilanmagan savollar xato hisoblanadi.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-2xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                Ortga qaytish
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Baholanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Topshirish va tekshirish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}