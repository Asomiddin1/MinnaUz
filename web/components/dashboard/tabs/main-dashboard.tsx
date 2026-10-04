'use client';

import { KitsuneMessage } from '@/components/kitsune/kitsune-message';

import * as React from 'react';
import Link from 'next/link';
import {
  Flame,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
  Award,
  Sparkles,
  Target,
  ArrowRight,
  Clock,
} from 'lucide-react';

import { useLang } from '@/lib/i18n';
import { api, UserDashboardStats, BannerItem, NotificationItem, JlptUserTestHistoryItem, getMediaUrl } from '@/lib/api';
import { getNextJLPTCountdown, getNextJLPTExamDate, JLPTCountdown } from '@/lib/jlpt';
import { StudyPlanModal } from '@/components/dashboard/study-plan-modal';
import { NotificationModal } from '@/components/dashboard/notification-modal';

import { DashboardBanner, DashboardSlide } from '@/components/dashboard/dashboard-banner';
import { StreakCalendar } from '@/components/dashboard/streak-calendar';
import {
  DashboardStats,
  ActiveCourseWidget,
  TestsWidget,
  ProgressWidget,
} from '@/components/dashboard/dashboard-widgets';

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Target,
  Award,
  PlayCircle,
  TrendingUp,
  Flame,
  BookOpen,
  CheckCircle2,
};

export function MainDashboard() {
  const { lang, t } = useLang();
  const [statsData, setStatsData] = React.useState<UserDashboardStats | null>(null);
  const [customBanners, setCustomBanners] = React.useState<BannerItem[]>([]);
  const [testHistory, setTestHistory] = React.useState<JlptUserTestHistoryItem[]>([]);
  const [dismissedBannerIds, setDismissedBannerIds] = React.useState<string[]>([]);
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationItem | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  // 1 soniyali jonli hisoblagich (Kun, Soat, Daqiqa, Soniya)
  const [countdown, setCountdown] = React.useState<JLPTCountdown>(() => getNextJLPTCountdown());
  const examInfo = React.useMemo(() => getNextJLPTExamDate(), []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getNextJLPTCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load dismissed banners from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('minna_dismissed_banners');
      if (saved) {
        setDismissedBannerIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      const [statsRes, bannersRes, testHistoryRes] = await Promise.all([
        api.getUserDashboardStats().catch(() => null),
        api.getBanners().catch(() => []),
        api.getJlptTestHistory(4).catch(() => []),
      ]);

      if (statsRes) {
        setStatsData(statsRes);
        if (statsRes.studyPlan?.isConfigured === false) {
          setIsOnboardingOpen(true);
        }
      }
      if (bannersRes) {
        setCustomBanners(bannersRes);
      }
      if (Array.isArray(testHistoryRes)) {
        setTestHistory(testHistoryRes);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        api.logStudyTime(1).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDismissSlide = (slideId: string | number) => {
    const idStr = String(slideId);
    const updated = [...dismissedBannerIds, idStr];
    setDismissedBannerIds(updated);
    try {
      localStorage.setItem('minna_dismissed_banners', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Fallback data
  const studyPlan = statsData?.studyPlan;
  const targetLevel = studyPlan?.targetLevel || 'N5';
  const weeklyGoalHours = studyPlan?.weeklyGoalHours || 4;
  const activeCourse = statsData?.activeCourse;
  const nextLesson = activeCourse?.nextLesson;
  const studyTime = statsData?.studyTime;
  const weeklyProgress = studyTime?.weeklyProgressPercent ?? 0;

  const courseTargetUrl = activeCourse
    ? nextLesson
      ? `/${lang}/dashboard/courses/${activeCourse.slug || activeCourse.id}/lessons/${nextLesson.id}`
      : `/${lang}/dashboard/courses/${activeCourse.slug || activeCourse.id}`
    : `/${lang}/dashboard/courses`;

  // 1. Core Default Dynamic Slides (JLPT olib tashlandi, faqat maqsad qoldi)
  // 1. Core Default Dynamic Slides (JLPT olib tashlandi, faqat maqsad qoldi)
  const defaultSlides: DashboardSlide[] = [
    {
      id: 'default-weekly-goal',
      tag: t?.dash?.banner?.weeklyGoalTag || 'Haftalik maqsad',
      tagIcon: Target,
      title: t?.dash?.banner?.weeklyGoalTitle || 'Haftalik rejangiz qanday ketyapti?',
      desc: (t?.dash?.banner?.weeklyGoalDesc || 'Siz bu hafta rejangizning {percent}% qismini bajardingiz. Belgilangan maqsadga yetishish uchun oz qoldi!').replace('{percent}', String(weeklyProgress)),
      btnText: t?.dash?.banner?.details || 'Batafsil',
      btnUrl: null,
      btnIcon: TrendingUp,
      actionType: 'PLAN_MODAL',
      image: '/new-default-banner.jpg',
      isDismissible: false,
    },
  ];

  // 2. Custom Admin Banners
  const convertedCustomSlides: DashboardSlide[] = customBanners
    .filter((b) => !dismissedBannerIds.includes(b.id))
    .map((b) => {
      const isLink = b.actionType === 'LINK' && Boolean(b.btnUrl);

      const notifItem: NotificationItem = b.notification || {
        id: b.notificationId || String(b.id),
        title: b.title,
        message: b.desc,
        content: b.desc,
        type: 'PROMO',
        audience: 'ALL',
        imageUrl: b.image ? getMediaUrl(b.image) : undefined,
        videoUrl: null,
        actionUrl: b.btnUrl || null,
        actionText: b.btnUrl ? (t?.dash?.banner?.go || 'Oʻtish') : (t?.dash?.banner?.understood || 'Tushunarli'),
        createdAt: new Date().toISOString(),
      };

      return {
        id: b.id,
        tag: b.tag || t?.dash?.banner?.announcement || 'Eʼlon',
        tagIcon: ICON_MAP[b.tagIcon] || Sparkles,
        title: b.title,
        desc: b.desc,
        btnText: b.btnText || t?.dash?.banner?.details || 'Batafsil',
        btnUrl: isLink && b.btnUrl ? b.btnUrl : null,
        btnIcon: ICON_MAP[b.btnIcon] || ArrowRight,
        actionType: isLink ? 'LINK' : 'NOTIFICATION_DETAIL',
        notification: notifItem,
        image: b.image || '',
        isDismissible: b.isDismissible,
      };
    });

  const allSlides = [...defaultSlides, ...convertedCustomSlides];

  const daysSuffix = t?.dash?.stats?.daysSuffix || 'kun';
  const itemsSuffix = t?.dash?.stats?.itemsSuffix || 'ta';

  const statsProps = [
    {
      label: t?.dash?.stats?.streak || 'Streak (kunlar)',
      value: `${statsData?.streakDays ?? 0} ${daysSuffix}`,
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: t?.dash?.stats?.wordsLearned || 'Yodlangan soʻzlar',
      value: `${statsData?.wordsLearned || 0} ${itemsSuffix}`,
      icon: BookOpen,
      color: 'text-[#0071e3] bg-[#0071e3]/10',
    },
    {
      label: t?.dash?.stats?.lessonsCompleted || 'Yakunlangan darslar',
      value: `${statsData?.completedLessons || 0} / ${statsData?.totalLessons || activeCourse?.totalLessons || 0}`,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: `JLPT ${targetLevel} ${t?.dash?.stats?.levelGoal || 'tayyorgarlik'}`,
      value: `${statsData?.n5ProgressPercent || 0}%`,
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
  ];

  const weekdays = t?.dash?.calendar?.weekdays || ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
  const timeUnits = [
    { label: t?.dash?.countdown?.units?.days || 'KUN', value: String(countdown.days).padStart(2, '0') },
    { label: t?.dash?.countdown?.units?.hours || 'SOAT', value: String(countdown.hours).padStart(2, '0') },
    { label: t?.dash?.countdown?.units?.minutes || 'DAQ', value: String(countdown.minutes).padStart(2, '0') },
    { label: t?.dash?.countdown?.units?.seconds || 'SON', value: String(countdown.seconds).padStart(2, '0') },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      <StudyPlanModal
        isOpen={isPlanModalOpen || isOnboardingOpen}
        isOnboarding={isOnboardingOpen}
        initialPlan={studyPlan}
        onClose={() => {
          setIsPlanModalOpen(false);
          setIsOnboardingOpen(false);
        }}
        onSaved={loadData}
      />

      <NotificationModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      {!loading && (
        <KitsuneMessage
          state="welcome"
          variant={studyPlan?.isConfigured ? 'level' : 'pose'}
          level={studyPlan?.isConfigured ? studyPlan.targetLevel : undefined}
          messageKey="welcome"
          showLevel
          animate
        />
      )}

      {/* 1. DINAMIK BANNER */}
      <DashboardBanner
        slides={allSlides}
        onOpenPlan={() => setIsPlanModalOpen(true)}
        onOpenNotification={(notif) => setSelectedNotification(notif)}
        onDismissSlide={handleDismissSlide}
      />

      {/* 2. ZAMONAVIY JONLI JLPT TIMER PANELI */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-card to-amber-500/5 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>
                {(t?.dash?.countdown?.untilExam || 'JLPT {season} Imtihonigacha').replace('{season}', countdown.season)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {t?.dash?.countdown?.title || 'Vaqt ketyapti! Bilimingizni muntazam mustahkamlab boring.'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t?.dash?.countdown?.officialDate || 'Rasmiy imtihon sanasi:'} <span className="font-semibold text-foreground">{countdown.formattedDate}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {timeUnits.map((unit, index) => (
                <React.Fragment key={unit.label}>
                  <div className="flex flex-col items-center">
                    <div className="min-w-[44px] sm:min-w-[54px] h-12 sm:h-14 flex items-center justify-center rounded-2xl bg-secondary/80 border border-border font-mono text-lg sm:text-2xl font-black text-foreground shadow-inner">
                      {unit.value}
                    </div>
                    <span className="mt-1 text-[9px] sm:text-[10px] font-bold tracking-wider text-muted-foreground">
                      {unit.label}
                    </span>
                  </div>
                  {index < timeUnits.length - 1 && (
                    <span className="text-muted-foreground font-bold text-base sm:text-lg -mt-3.5">:</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Link
              href={`/${lang}/dashboard/tests`}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-sm"
            >
              <Award className="h-4 w-4" />
              <span>{t?.dash?.countdown?.mockTestBtn || 'Mock Test'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. STATISTIKA KARTALARI */}
      <DashboardStats stats={statsProps} />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <ActiveCourseWidget
            activeCourse={activeCourse}
            nextLesson={nextLesson}
            courseTargetUrl={courseTargetUrl}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestsWidget
              examInfo={examInfo}
              targetLevel={targetLevel}
              lang={lang}
              testHistory={testHistory}
              loading={loading}
            />

            <ProgressWidget
              studyTime={studyTime}
              weeklyActivity={studyTime?.weeklyActivity || []}
              weeklyGoalHours={weeklyGoalHours}
              weeklyProgress={weeklyProgress}
            />
          </div>
        </div>

        <div className="space-y-6">
          <KitsuneMessage state="resting" messageKey="resting" size="small" />
          <StreakCalendar
            streakDays={statsData?.streakDays ?? 0}
            activeDates={statsData?.activeDates ?? []}
          />
        </div>
      </div>
    </div>
  );
}