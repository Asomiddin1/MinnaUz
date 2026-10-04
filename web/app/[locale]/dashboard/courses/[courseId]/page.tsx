'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Layers,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  Crown,
} from 'lucide-react';
import { api, CourseDetailsResponse, CourseLessonSummary } from '@/lib/api';
import { useLang } from '@/lib/i18n';

export default function CourseRoadmapPage() {
  const { lang, t } = useLang();
  const dDict = t?.coursesPage?.detail;
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = React.useState<CourseDetailsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadDetails() {
      try {
        const data = await api.getCourseDetails(courseId);
        setCourse(data);
      } catch (err: any) {
        setError(err.message || dDict?.notFound || 'Kursni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [courseId, dDict]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-[13px] text-muted-foreground">{dDict?.loading || 'Kurs maʼlumotlari yuklanmoqda...'}</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <div className="text-destructive font-medium">{error || dDict?.notFound || 'Kurs topilmadi'}</div>
        <Link
          href={`/${lang}/dashboard/courses`}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-[13px] font-medium hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{dDict?.backToCourses || 'Kurslar roʻyxatiga qaytish'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-300 pb-24">
      {/* Back Link */}
      <div>
        <Link
          href={`/${lang}/dashboard/courses`}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{dDict?.allCoursesLink || t?.admin?.courses?.title || 'Barcha kurslar'}</span>
        </Link>
      </div>

      {/* Hero / Course Summary Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                JLPT {course.level}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {(dDict?.lessonsCompleted || '{completed} / {total} dars yakunlangan')
                  .replace('{completed}', String(course.completedLessons))
                  .replace('{total}', String(course.totalLessons))}
              </span>
            </div>
            <h1 className="text-[22px] sm:text-[28px] font-bold text-foreground tracking-tight">
              {course.title}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Progress Widget */}
          <div className="flex md:flex-col items-center justify-between md:justify-center gap-2.5 p-4 rounded-xl bg-secondary/40 border border-border/50 min-w-[190px]">
            <div className="text-left md:text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {dDict?.overallProgress || t?.dash?.progress?.title || 'Umumiy progress'}
              </div>
              <div className="text-[26px] font-extrabold text-primary font-mono leading-tight mt-0.5">
                {course.progressPercent}%
              </div>
            </div>
            <div className="h-1.5 w-32 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modules Table List */}
      <div className="space-y-8">
        {course.modules.map((mod, moduleIndex) => {
          const completedCount = mod.lessons.filter((l) => l.isCompleted).length;

          return (
            <div
              key={mod.id}
              className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs"
            >
              {/* Module Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30 px-5 py-4 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 border border-primary/15 text-primary text-[13px] font-bold">
                    {moduleIndex + 1}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      <Layers className="h-3 w-3" />
                      <span>{dDict?.moduleTag || 'Modul'}</span>
                    </div>
                    <h2 className="text-[16px] font-bold text-foreground">{mod.title}</h2>
                  </div>
                </div>

                <div className="text-[12px] font-medium text-muted-foreground self-end sm:self-auto">
                  {(dDict?.moduleCompleted || 'Tugatilgan: {completed} / {total} ta dars')
                    .replace('{completed}', String(completedCount))
                    .replace('{total}', String(mod.lessons.length))}
                </div>
              </div>

              {mod.lessons.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-foreground">Tayyorlanmoqda</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ushbu modul darslari keyingi bosqichda qoʻshiladi.
                  </p>
                </div>
              ) : (
              /* Responsive Table Container */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4 w-14 text-center">{dDict?.colNumber || '№'}</th>
                      <th className="py-3 px-4 min-w-[220px]">{dDict?.colTopic || 'Dars mavzusi'}</th>
                      <th className="py-3 px-3 text-center w-20 hidden md:table-cell">Kotoba</th>
                      <th className="py-3 px-3 text-center w-20 hidden md:table-cell">Bunpou</th>
                      <th className="py-3 px-3 text-center w-20 hidden md:table-cell">Kanji</th>
                      <th className="py-3 px-3 text-center w-20 hidden md:table-cell">Renshuu</th>
                      <th className="py-3 px-4 text-center w-28">{dDict?.colStatus || 'Holat'}</th>
                      <th className="py-3 px-4 text-right w-32">{dDict?.colAction || 'Harakat'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {mod.lessons.map((lesson) => {
                      const isCompleted = Boolean(lesson.isCompleted || lesson.status === 'COMPLETED');
                      const isLocked = Boolean(lesson.status === 'LOCKED' || lesson.isLocked || lesson.lockReason === 'PRO_REQUIRED');
                      const isActive = !isCompleted && !isLocked;

                      return (
                        <tr
                          key={lesson.id}
                          className={`hover:bg-secondary/20 transition-colors ${
                            isActive ? 'bg-primary/5' : ''
                          }`}
                        >
                          {/* Order / Number */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold ${
                                isCompleted
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : isActive
                                  ? 'bg-primary/15 text-primary'
                                  : 'bg-secondary text-muted-foreground'
                              }`}
                            >
                              {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : lesson.order}
                            </span>
                          </td>

                          {/* Lesson Title & Japanese Tag */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              {lesson.japaneseTitle && (
                                <span className="text-[11px] font-bold text-primary">
                                  {lesson.japaneseTitle}
                                </span>
                              )}
                              <span className="font-semibold text-foreground">
                                {lesson.title.replace(/^\d+-dars:?\s*/i, '')}
                              </span>
                            </div>
                          </td>

                          {/* Breakdown Badges (Desktop) */}
                          <td className="py-3.5 px-3 text-center hidden md:table-cell text-muted-foreground text-[12px]">
                            {lesson.counts?.kotobaItems ?? '—'}
                          </td>
                          <td className="py-3.5 px-3 text-center hidden md:table-cell text-muted-foreground text-[12px]">
                            {lesson.counts?.bunpouItems ?? '—'}
                          </td>
                          <td className="py-3.5 px-3 text-center hidden md:table-cell text-muted-foreground text-[12px]">
                            {lesson.counts?.kanjiItems ?? '—'}
                          </td>
                          <td className="py-3.5 px-3 text-center hidden md:table-cell text-muted-foreground text-[12px]">
                            {lesson.counts?.renshuuItems ?? '—'}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                                <span>{dDict?.statusCompleted || 'Bajarildi'}</span>
                              </span>
                            ) : isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                <Sparkles className="h-3 w-3" />
                                <span>{dDict?.statusActive || 'Faol'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                <Lock className="h-3 w-3" />
                                <span>{dDict?.statusLocked || 'Yopiq'}</span>
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            {lesson.lockReason === 'PRO_REQUIRED' ? (
                              <Link
                                href={`/${lang}/dashboard/premium`}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-yellow-500/10 hover:bg-yellow-500 text-yellow-600 dark:text-yellow-400 hover:text-black transition-all border border-yellow-500/30 shadow-xs cursor-pointer"
                              >
                                <Lock className="h-3 w-3" />
                                <span>{dDict?.btnUnlockPro || 'Pro ochish'}</span>
                              </Link>
                            ) : isLocked ? (
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-secondary/60 text-muted-foreground/60 cursor-not-allowed select-none"
                                title={dDict?.lockedTooltip || 'Ushbu darsni ochish uchun avvalgi darsni yakunlang'}
                              >
                                <Lock className="h-3 w-3" />
                                <span>{dDict?.btnLocked || 'Qulflangan'}</span>
                              </button>
                            ) : (
                              <Link
                                href={`/${lang}/dashboard/courses/${course.slug || course.id}/lessons/${lesson.id}`}
                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                                  isCompleted
                                    ? 'border border-border/80 bg-secondary/50 text-foreground hover:bg-secondary'
                                    : 'bg-primary text-white hover:bg-primary/90 shadow-xs'
                                }`}
                              >
                                {isCompleted ? (
                                  <>
                                    <RotateCcw className="h-3 w-3" />
                                    <span>{dDict?.btnReview || 'Takrorlash'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3 w-3 fill-current" />
                                    <span>{dDict?.btnStartLesson || 'Boshlash'}</span>
                                  </>
                                )}
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}