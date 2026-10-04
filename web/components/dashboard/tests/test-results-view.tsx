'use client';

import { KitsuneMessage } from '@/components/kitsune/kitsune-message';
import { KitsuneMascot } from '@/components/kitsune/kitsune-mascot';

import * as React from 'react';
import Link from 'next/link';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Sparkles,
  Share2,
  Flame,
} from 'lucide-react';
import { TestSubmitResponse } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { testKitsuneState } from '@/lib/kitsune/state';

interface TestResultsViewProps {
  result: TestSubmitResponse;
  onRetake: () => void;
}

export function TestResultsView({ result, onRetake }: TestResultsViewProps) {
  const { lang } = useLang();
  const [filter, setFilter] = React.useState<'ALL' | 'CORRECT' | 'WRONG'>('ALL');

  const totalQuestions = result.answers?.length || 0;
  const correctCount = result.answers?.filter((a) => a.isCorrect).length || 0;
  const wrongCount = totalQuestions - correctCount;

  // Group by sections for breakdown
  const sectionStats = React.useMemo(() => {
    const map: Record<string, { total: number; correct: number; points: number }> = {};
    for (const a of result.answers || []) {
      const sec = a.section || 'UMUMIY';
      if (!map[sec]) map[sec] = { total: 0, correct: 0, points: 0 };
      map[sec].total += 1;
      if (a.isCorrect) {
        map[sec].correct += 1;
        map[sec].points += a.points;
      }
    }
    return map;
  }, [result.answers]);

  const filteredAnswers = React.useMemo(() => {
    if (filter === 'CORRECT') return result.answers.filter((a) => a.isCorrect);
    if (filter === 'WRONG') return result.answers.filter((a) => !a.isCorrect);
    return result.answers;
  }, [result.answers, filter]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    if (mins === 0) return `${rem} soniya`;
    return `${mins} daqiqa ${rem > 0 ? `${rem} soniya` : ''}`;
  };

  const getSectionTitle = (sec: string) => {
    switch (sec) {
      case 'MODULE_1_VOCAB':
      case 'KOTOBA':
        return '1-Modul: 文字・語彙 (Lugʻat & Kanji)';
      case 'MODULE_2_GRAMMAR_READING':
      case 'BUNPOU':
      case 'DOKKAI':
        return '2-Modul: 文法・読解 (Grammatika & Oʻqish)';
      case 'MODULE_3_LISTENING':
      case 'CHOUKAI':
        return '3-Modul: 聴解 (Tinglab tushunish)';
      default:
        return sec;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${lang}/dashboard/tests`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Barcha testlarga qaytish</span>
        </Link>
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary text-xs font-semibold text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <span>Qayta topshirish</span>
        </button>
      </div>

      <KitsuneMessage
        state={testKitsuneState(result.isPassed)}
        messageKey={result.isPassed ? 'passed' : 'encouraging'}
        animate
        announce
      />

      {/* Hero Scorecard Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-lg backdrop-blur-xl ${
          result.isPassed
            ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-background'
            : 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border shadow-xs">
              {result.isPassed ? (
                <span className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Muvaffaqiyatli oʻtdi 🎉 (Passed)
                </span>
              ) : (
                <span className="text-amber-500 border-amber-500/30 bg-amber-500/10 flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5" />
                  Oʻta olmadi (Keyingi safar albatta oʻtasiz!)
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {result.testTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Imtihon natijalari va savollar boʻyicha toʻliq tahlil
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Vaqt: {formatTime(result.timeSpentSeconds)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {correctCount} ta toʻgʻri
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                {wrongCount} ta xato
              </span>
            </div>
          </div>

          {/* Big Score Dial with Kitsune */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-border/60 bg-card/60 shadow-md min-w-[170px] shrink-0 text-center">
            {/* Center Kitsune mascot large on result */}
            <KitsuneMascot
              size="hero"
              state={result.isPassed ? 'celebrating' : 'encouraging'}
              variant="pose"
              level={result.passingScore !== undefined ? String(result.passingScore) : null}
              animate
              className="w-36 sm:w-72"
            />
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-4xl sm:text-5xl font-black text-foreground">
                {result.score}
              </span>
              <span className="text-base sm:text-lg font-semibold text-muted-foreground">
                /{result.totalScore}
              </span>
            </div>
            <div className="mt-1 flex flex-col items-center gap-1 text-xs font-bold">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  result.isPassed
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-amber-500/20 text-amber-500'
                }`}
              >
                {result.percentage}% ({result.score} ball)
              </span>
              <p className="text-[10px] text-muted-foreground font-medium">
                Oʻtish chegarasi: <strong className="text-foreground">{result.passingScore || 80} ball</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation on Pass */}
      {result.isPassed && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="confetti-container h-full w-full grid place-items-center">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece absolute w-3 h-3 opacity-70"
                style={{
                  animation: `confetti-fall 3s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * -20}%`,
                  background: `hsl(${Math.random() * 360}, 70%, 70%)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section Breakdown Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(sectionStats).map(([sectionKey, stat]) => {
          const secPercent = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
          return (
            <div
              key={sectionKey}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="truncate">{getSectionTitle(sectionKey)}</span>
                <span className="text-primary">{secPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    secPercent >= 60 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${secPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stat.correct} / {stat.total} toʻgʻri javob ({stat.points} ball)
              </p>
            </div>
          );
        })}
      </div>

      {/* Questions Analysis Header & Filters */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Savollar Tahlili va Oʻzbekcha Izohlar
            </h2>
            <p className="text-xs text-muted-foreground">
              Har bir savolning toʻgʻri javobi va grammatik qoidalari bilan tanishing
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/40 border border-border/50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Barchasi ({totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilter('CORRECT')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'CORRECT'
                  ? 'bg-card text-emerald-500 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Toʻgʻri ({correctCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('WRONG')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'WRONG'
                  ? 'bg-card text-destructive shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Xato ({wrongCount})
            </button>
          </div>
        </div>

        {/* Questions Detailed List */}
        <div className="space-y-4">
          {filteredAnswers.map((item, idx) => (
            <div
              key={item.questionId || idx}
              className={`rounded-2xl border p-5 transition-all shadow-xs space-y-4 ${
                item.isCorrect
                  ? 'border-emerald-500/30 bg-card'
                  : 'border-destructive/30 bg-card'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-bold text-muted-foreground">
                      #{item.questionNumber}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {getSectionTitle(item.section)}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground pt-1">
                    {item.questionText}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                    item.isCorrect
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}
                >
                  {item.isCorrect ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Toʻgʻri (+{item.points} ball)
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Notoʻgʻri (0 ball)
                    </>
                  )}
                </span>
              </div>

              {/* 4 Options Grid */}
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {item.options?.map((opt, optIdx) => {
                  const isSelected = item.selectedAnswer === opt;
                  const isCorrectOpt = item.correctAnswer === opt;

                  let optClass = 'border-border/60 bg-secondary/10 text-muted-foreground';
                  if (isCorrectOpt) {
                    optClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold shadow-xs';
                  } else if (isSelected && !isCorrectOpt) {
                    optClass = 'border-destructive bg-destructive/10 text-destructive font-bold line-through';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm transition-all ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="h-6 w-6 rounded-lg bg-card/80 border border-border/60 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {optIdx + 1}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                      {isCorrectOpt && (
                        <span className="text-[11px] text-emerald-500 font-bold ml-2 shrink-0">
                          Toʻgʻri javob ✓
                        </span>
                      )}
                      {isSelected && !isCorrectOpt && (
                        <span className="text-[11px] text-destructive font-bold ml-2 shrink-0">
                          Sizning javobingiz ✗
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Uzbek Explanation */}
              {item.explanation && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Oʻzbek tilidagi tushuntirish:</span>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    {item.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href={`/${lang}/dashboard/tests`}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-border/60 bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all text-center cursor-pointer shadow-xs"
        >
          Barcha testlarga qaytish
        </Link>
        <button
          type="button"
          onClick={onRetake}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 shadow-md transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Testni qayta topshirish</span>
        </button>
      </div>
    </div>
  );
}