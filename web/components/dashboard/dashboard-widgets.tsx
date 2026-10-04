'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  ChevronRight,
  Play,
  GraduationCap,
} from 'lucide-react';
import { api, JlptUserTestHistoryItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';

export function DashboardStats({ stats }: { stats: any[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${stat.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
              <p className="headline text-[22px] font-bold text-foreground mt-0.5">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActiveCourseWidget({ activeCourse, nextLesson, courseTargetUrl }: any) {
  const { t } = useLang();
  const cDict = t?.dash?.activeCourse;

  const lessonsCountStr = activeCourse
    ? (cDict?.lessonsCount || '{completed} / {total} Dars')
        .replace('{completed}', String(activeCourse.completedLessons))
        .replace('{total}', String(activeCourse.totalLessons))
    : (cDict?.lessonsCount || '{completed} / {total} Dars')
        .replace('{completed}', '0')
        .replace('{total}', '0');

  return (
    <div className="space-y-6 rounded-[28px] border border-border bg-card p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-[#0071e3] font-semibold">
            {cDict?.badge || 'Joriy Kurs'}
          </p>
          <h2 className="headline text-[22px] font-semibold text-foreground mt-1">
            {activeCourse?.title || cDict?.defaultTitle || 'Minna no Nihongo I (N5)'}
          </h2>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[13px] font-medium text-foreground">
          {lessonsCountStr}
        </span>
      </div>

      <div className="rounded-2xl bg-secondary/40 p-5 border border-border/50 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {cDict?.nextLesson || 'Navbatdagi dars:'}
            </p>
            <h3 className="text-[17px] font-semibold text-foreground mt-1">
              {nextLesson
                ? nextLesson.title.replace(/^\s*\d+\s*[-–—.]?\s*dars\s*:\s*/i, '')
                  ? `${nextLesson.order}-dars: ${nextLesson.title.replace(/^\s*\d+\s*[-–—.]?\s*dars\s*:\s*/i, '')}`
                  : `${nextLesson.order}-dars`
                : (cDict?.defaultNextLesson || '1-dars: Tanishtiruv va asoslar')}
            </h3>
          </div>
          <span className="shrink-0 rounded-lg bg-[#0071e3]/10 px-2.5 py-1 text-[12px] font-semibold text-[#0071e3]">
            {nextLesson?.category || cDict?.defaultCategory || 'Grammatika'}
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-[13px] text-muted-foreground">
            <span>{cDict?.progress || 'Kurs oʻzlashtirilishi'}</span>
            <span className="font-semibold text-foreground">{activeCourse?.progressPercent || 0}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-[#0071e3] transition-all duration-500" style={{ width: `${Math.max(3, activeCourse?.progressPercent || 0)}%` }} />
          </div>
        </div>

        <div className="pt-2">
          <Link href={courseTargetUrl} className="block">
            <button type="button" className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-[14px] font-medium text-background transition-opacity duration-200 hover:opacity-90 cursor-pointer">
              <span>{cDict?.goToLesson || 'Darsga oʻtish'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatTestDate(dateStr: string, t: any, lang: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t?.dash?.testsWidget?.today || 'Bugun';
    if (diffDays === 1) return t?.dash?.testsWidget?.yesterday || 'Kecha';
    if (diffDays < 7) {
      return (t?.dash?.testsWidget?.daysAgo || '{days} kun oldin').replace('{days}', String(diffDays));
    }
    const localeCode = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : lang === 'ja' ? 'ja-JP' : 'en-US';
    return d.toLocaleDateString(localeCode, { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function getLevelBadgeStyle(level: string) {
  switch (level) {
    case 'N5':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'N4':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'N3':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'N2':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'N1':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    default:
      return 'bg-secondary text-muted-foreground border-border/60';
  }
}

export function TestsWidget({
  examInfo,
  targetLevel = 'N5',
  lang,
  testHistory: propHistory,
  loading: propLoading,
}: {
  examInfo: any;
  targetLevel?: string;
  lang: string;
  testHistory?: JlptUserTestHistoryItem[];
  loading?: boolean;
}) {
  const [history, setHistory] = React.useState<JlptUserTestHistoryItem[]>(propHistory || []);
  const [loading, setLoading] = React.useState<boolean>(
    propLoading !== undefined ? propLoading : propHistory === undefined
  );

  React.useEffect(() => {
    if (propHistory !== undefined) {
      setHistory(propHistory);
      setLoading(false);
      return;
    }

    let mounted = true;
    api
      .getJlptTestHistory(3)
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [propHistory]);

  const { t } = useLang();
  const twDict = t?.dash?.testsWidget;

  return (
    <div className="space-y-5 rounded-[28px] border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span>{twDict?.eyebrow || 'Imtihon'}</span>
            </p>
            <h3 className="headline text-[19px] font-semibold text-foreground mt-0.5">
              {twDict?.title || 'JLPT Mock Testlar'}
            </h3>
          </div>
          <Link
            href={`/${lang}/dashboard/tests`}
            className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
          >
            <span>{twDict?.all || 'Barchasi'}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {/* Countdown Card */}
          {examInfo && (
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-3 border border-amber-500/30">
              <div>
                <p className="text-[13px] font-bold text-foreground">
                  {(twDict?.examTitle || 'JLPT {season} Imtihoni').replace('{season}', examInfo.season)}
                </p>
                <p className="text-[11px] text-muted-foreground">{examInfo.formattedDate}</p>
              </div>
              <span className="text-[12px] font-bold text-amber-500 bg-amber-500/20 px-2.5 py-1 rounded-full">
                {(twDict?.daysRemaining || '{days} kun qoldi').replace('{days}', String(examInfo.daysRemaining))}
              </span>
            </div>
          )}

          {/* Test History Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-primary" />
              <span>{twDict?.historyTitle || 'Topshirilgan testlar tarixi'}</span>
            </span>
            {history.length > 0 && (
              <span className="text-[11px] text-muted-foreground font-medium">
                {(twDict?.attempts || '{count} ta urinish').replace('{count}', String(history.length))}
              </span>
            )}
          </div>

          {/* Test History List / Skeleton / Empty State */}
          {loading ? (
            <div className="space-y-2">
              <div className="h-14 rounded-xl bg-secondary/40 animate-pulse border border-border/40" />
              <div className="h-14 rounded-xl bg-secondary/30 animate-pulse border border-border/30" />
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-secondary/15 p-4 text-center space-y-2">
              <p className="text-xs font-semibold text-foreground">
                {twDict?.emptyTitle || 'Hali mock test topshirmadingiz'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {twDict?.emptyDesc || 'Haqiqiy imtihon andozasidagi testni yechib, bilimingizni sinab koʻring.'}
              </p>
              <Link
                href={`/${lang}/dashboard/tests`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-all active:scale-95 mt-1"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>{twDict?.takeTestBtn || 'Test topshirish'}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/${lang}/dashboard/tests/results/${item.id}`}
                  className="group flex items-center justify-between rounded-xl bg-secondary/35 hover:bg-secondary/70 p-3 border border-border/40 hover:border-primary/40 transition-all cursor-pointer"
                  title={twDict?.viewResults || 'Natijalar va tahlilni koʻrish'}
                >
                  <div className="min-w-0 pr-2 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${getLevelBadgeStyle(
                          item.level
                        )}`}
                      >
                        {item.level}
                      </span>
                      <p className="text-[13px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.testTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatTestDate(item.completedAt, t, lang)}</span>
                      <span>•</span>
                      <span className="font-semibold">{item.percentage}%</span>
                      {item.timeSpentSeconds > 0 && (
                        <>
                          <span>•</span>
                          <span>{Math.round(item.timeSpentSeconds / 60)} {twDict?.minutes || 'daq'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-[12px] font-extrabold text-foreground">
                        {item.score} <span className="text-[10px] text-muted-foreground font-normal">/ {item.totalScore}</span>
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          item.isPassed ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {item.isPassed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{twDict?.passed || 'Oʻtdi'}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>{twDict?.failed || 'Oʻtmadi'}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Link href={`/${lang}/dashboard/tests`} className="block pt-2">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <Award className="h-4 w-4 text-[#0071e3]" />
          <span>{twDict?.allTestsBtn || 'Barcha testlar'}</span>
        </button>
      </Link>
    </div>
  );
}

export function ProgressWidget({ studyTime, weeklyActivity, weeklyGoalHours, weeklyProgress }: any) {
  const { t } = useLang();
  const pwDict = t?.dash?.progressWidget;

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-bold text-foreground">
            {pwDict?.title || 'Umumiy progress'}
          </h3>
          <span className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-[12px] font-medium text-muted-foreground">
            {pwDict?.period || 'Bu hafta'}
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#0071e3]" />
              <span>{pwDict?.todayStudyTime || 'Bugungi oʻrganish vaqti'}</span>
            </p>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[28px] font-bold text-foreground">{studyTime?.todayHours ?? 0}</span>
            <span className="text-[15px] font-semibold text-foreground">{pwDict?.hourUnit || 'h'}</span>
            <span className="text-[28px] font-bold text-foreground ml-1">{studyTime?.todayMinutesRemainder ?? 0}</span>
            <span className="text-[15px] font-semibold text-foreground">{pwDict?.minUnit || 'm'}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-1.5 pt-5 pb-1">
          {weeklyActivity.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-20 items-end justify-center w-full">
                <div className={`w-full max-w-[28px] rounded-full transition-all duration-300 ${item.active ? 'bg-[#0071e3] shadow-xs' : 'bg-[#0071e3]/60'} ${item.height}`} />
              </div>
              <span className={`text-[12px] font-medium ${item.active ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{item.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground font-medium">
            {(pwDict?.weeklyGoal || 'Haftalik maqsad ({hours} soat)').replace('{hours}', String(weeklyGoalHours))}
          </span>
          <span className="font-bold text-foreground">{weeklyProgress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: `${Math.min(100, Math.max(3, weeklyProgress))}%` }} />
        </div>
      </div>
    </div>
  );
}