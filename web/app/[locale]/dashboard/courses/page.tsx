'use client';

import { KitsuneMascot } from '@/components/kitsune/kitsune-mascot';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Play, CheckCircle2, Clock, Sparkles, Layers, ArrowRight, Award, Flame } from 'lucide-react';
import { api, CourseListItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function CoursesPage() {
  const { lang, t } = useLang();
  const cpDict = t?.coursesPage;
  const [courses, setCourses] = React.useState<CourseListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLevel, setSelectedLevel] = React.useState<string>('ALL');

  React.useEffect(() => {
    async function loadCourses() {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Kurslarni yuklashda xatolik:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const levels = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];

  const filteredCourses = courses.filter((c) => {
    if (selectedLevel === 'ALL') return true;
    return c.level === selectedLevel;
  });

  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const avgProgress = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1240px] mx-auto pb-12">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0071e3] via-[#005bb5] to-[#1d1d1f] p-6 sm:p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-[12px] font-semibold tracking-wide backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span>{cpDict?.badge || 'JLPT Standart Oʻquv Dasturi'}</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-bold tracking-tight leading-tight">
            {cpDict?.title || t?.courses?.title || 'Yapon tili kurslari va darsliklar'}
          </h1>
          <p className="text-[14px] sm:text-[16px] text-white/80 leading-relaxed">
            {cpDict?.subtitle || t?.courses?.subtitle || 'Minna no Nihongo xalqaro darsligi asosida tuzilgan 5 bosqichli toʻliq interaktiv oʻquv tizimi: Lugʻat (Kotoba), Grammatika (Bunpou), Kanji, Mashqlar (Renshuu) va AI suhbat.'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:w-fit">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
              {cpDict?.totalCourses || t?.admin?.courses?.courseTitle || 'Jami kurslar'}
            </div>
            <div className="text-[20px] font-bold mt-0.5">
              {(cpDict?.totalCoursesUnit || '{count} ta').replace('{count}', String(courses.length || 3))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
              {cpDict?.lessonsCount || t?.courses?.lessons || 'Darslar soni'}
            </div>
            <div className="text-[20px] font-bold mt-0.5">
              {(cpDict?.lessonsCountUnit || '{count}+ dars').replace('{count}', String(totalLessons || 80))}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
              {cpDict?.avgProgress || t?.dash?.progress?.title || 'Oʻrtacha oʻzlashtirish'}
            </div>
            <div className="text-[20px] font-bold mt-0.5">{avgProgress}%</div>
          </div>
        </div>

        {/* Decorative background glow circle */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-12 bottom-0 h-48 w-48 rounded-full bg-amber-400/15 blur-2xl" />
      </div>

      {/* Level Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {lvl === 'ALL' ? (cpDict?.allLevels || t?.video?.all || 'Barcha darajalar') : `JLPT ${lvl}`}
            </button>
          ))}
        </div>

        <div className="text-[13px] text-muted-foreground font-medium">
          {(cpDict?.coursesAvailable || '{count} ta kurs mavjud').replace('{count}', String(filteredCourses.length))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-[28px] border border-border bg-card/60 p-6 animate-pulse" />
          ))}
        </div>
      )}

      {/* Courses Cards Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const hasStarted = course.progress > 0;
            return (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-[28px] border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40 relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Badge & Meta */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-primary/10 px-3 py-1 text-[12px] font-bold text-primary tracking-wide">
                      {course.level}
                    </span>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {(cpDict?.modulesCount || '{count} modul').replace('{count}', String(course.totalModules || 3))}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {(cpDict?.lessonsCountShort || '{count} dars').replace('{count}', String(course.totalLessons || 25))}
                      </span>
                    </div>
                  </div>

                  <KitsuneMascot variant="level" level={course.level} size="small" />

                  {/* Course Title & Description */}
                  <div>
                    <h3 className="headline text-[20px] font-bold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground line-clamp-2">
                      {course.description || cpDict?.defaultDescription || 'Yapon tilini samarali va bosqichma-bosqich oʻrganish uchun moʻljallangan interaktiv kurs.'}
                    </p>
                  </div>

                  {/* Teacher / Author Info */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <UserAvatar
                      src={course.author?.avatarUrl}
                      name={course.author?.fullName}
                      size="xs"
                    />
                    <div className="text-[12px] truncate">
                      <span className="text-muted-foreground">{cpDict?.authorLabel || 'Muallif:'} </span>
                      <span className="font-semibold text-foreground">
                        {course.author?.fullName || cpDict?.authorFallback || 'MinnaUz Sensei (Rasmiy)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions & Progress */}
                <div className="pt-6 mt-6 border-t border-border/70 space-y-4">
                  {hasStarted ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[12px] text-muted-foreground font-medium">
                        <span>{cpDict?.progressLabel || 'Oʻzlashtirish'}</span>
                        <span className="font-bold text-foreground">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span>{cpDict?.recommendedBeginners || 'Yangi boshlovchilar uchun tavsiya etiladi'}</span>
                    </div>
                  )}

                  <Link
                    href={`/${lang}/dashboard/courses/${course.slug || course.id}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-[14px] font-semibold text-background transition-all hover:bg-primary hover:text-white cursor-pointer"
                  >
                    {hasStarted ? (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{cpDict?.btnContinue || t?.dash?.goal?.continue || 'Davom ettirish'}</span>
                      </>
                    ) : (
                      <>
                        <span>{cpDict?.btnStart || t?.courses?.startLesson || 'Kursni boshlash'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
