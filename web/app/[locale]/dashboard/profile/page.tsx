'use client';

import { KitsuneMessage } from '@/components/kitsune/kitsune-message';

import * as React from 'react';
import {
  Mail,
  Shield,
  Smartphone,
  Laptop,
  Trash2,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Target,
  Clock,
  Calendar,
  Edit3,
  Award,
  Sparkles,
  Layers,
  Camera,
  Check,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';
import { api, UserStudyPlan, MySubscriptionResponse } from '@/lib/api';
import { getNextJLPTExamDate } from '@/lib/jlpt';
import { StudyPlanModal } from '@/components/dashboard/study-plan-modal';
import { AvatarModal } from '@/components/dashboard/avatar-modal';
import { EditProfileModal } from '@/components/dashboard/profile/edit-profile-modal';
import { ProfileFramesCard } from '@/components/dashboard/profile/profile-frames-card';
import { UserAvatar } from '@/components/shared/user-avatar';

export default function ProfilePage() {
  const { user, devices, fetchDevices, revokeDevice, logout } = useAuth();
  const { lang, t } = useLang();
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [studyPlan, setStudyPlan] = React.useState<UserStudyPlan | null>(null);
  const [mySub, setMySub] = React.useState<MySubscriptionResponse | null>(null);
  const [subLoading, setSubLoading] = React.useState(true);

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = React.useState(false);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  const examInfo = React.useMemo(() => getNextJLPTExamDate(), []);

  const loadPlan = React.useCallback(async () => {
    try {
      const plan = await api.getStudyPlan();
      setStudyPlan(plan);
    } catch {
      // ignore
    }
  }, []);

  const loadSub = React.useCallback(async () => {
    try {
      setSubLoading(true);
      const subRes = await api.getMySubscription();
      setMySub(subRes);
    } catch {
      // ignore
    } finally {
      setSubLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDevices();
    loadPlan();
    loadSub();
  }, [fetchDevices, loadPlan, loadSub]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDevices(), loadPlan(), loadSub()]);
    setRefreshing(false);
  };

  const handleRevoke = async (deviceId: string) => {
    setRevokingId(deviceId);
    try {
      await revokeDevice(deviceId);
    } finally {
      setRevokingId(null);
    }
  };

  const handleProfileUpdated = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const pDict = t?.profilePage;
  const userDict = pDict?.userInfo;
  const planDict = pDict?.studyPlanSection;
  const devDict = pDict?.devicesSection;
  const actDict = pDict?.actions;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-0 animate-in fade-in duration-300">
      {/* Modals */}
      <StudyPlanModal
        isOpen={isPlanModalOpen}
        initialPlan={studyPlan}
        onClose={() => setIsPlanModalOpen(false)}
        onSaved={(newPlan) => {
          setStudyPlan(newPlan);
          loadPlan();
        }}
      />

      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSuccess={handleProfileUpdated}
      />

      {/* Header Banner */}
      <div className="border-b border-border/70 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{pDict?.badge || 'Shaxsiy Kabinet'}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {pDict?.title || 'Profil & Sozlamalar'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pDict?.subtitle || 'Shaxsiy maʼlumotlar, oʻrganish surʼati va qurilmalar xavfsizligini boshqaring.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 hover:bg-secondary text-foreground text-xs font-medium transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title={pDict?.refresh || t?.admin?.overview?.refresh || 'Yangilash'}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{pDict?.refresh || t?.admin?.overview?.refresh || 'Yangilash'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. User Info Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative group cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
              title={userDict?.avatarTip || 'Profil rasmini oʻzgartirish'}
            >
              <UserAvatar
                user={user}
                size="2xl"
                className="rounded-full border-2 border-primary/20 shadow-md transition-all group-hover:scale-102 group-hover:border-primary"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
                <Camera className="h-5 w-5 drop-shadow-sm" />
              </div>
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center shadow-xs transition-transform group-hover:scale-110">
                <Camera className="h-2.5 w-2.5" />
              </span>
            </button>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                  {user?.fullName || userDict?.noName || 'Ism kiritilmagan'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Edit3 className="h-3 w-3 text-primary" />
                  <span>{userDict?.edit || 'Tahrirlash'}</span>
                </button>
                {showSuccessToast && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-in fade-in">
                    <Check className="h-3 w-3" />
                    {userDict?.saved || 'Saqlandi'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email || 'user@example.com'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500">
              <Shield className="h-3.5 w-3.5" />
              <span>{userDict?.role ? `${userDict.role}: ${user?.role || 'USER'}` : `Rol: ${user?.role || 'USER'}`}</span>
            </span>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/30 p-4 border border-border/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {userDict?.subStatus || 'Obuna holati'}
                </p>
                {subLoading ? (
                  <p className="text-xs text-muted-foreground mt-0.5">{userDict?.loading || 'Yuklanmoqda...'}</p>
                ) : mySub?.isPro ? (
                  <p className="text-sm sm:text-base font-bold text-foreground mt-0.5 truncate">
                    {mySub.subscription?.plan?.name || mySub.subscription?.tier || 'Pro'}{' '}
                    ·{' '}
                    <span className="text-emerald-500 font-bold">
                      {(userDict?.activeDays || 'Faol ({days} kun qoldi)').replace(
                        '{days}',
                        String(mySub.subscription?.daysRemaining ?? 0)
                      )}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-muted-foreground mt-0.5">
                    {userDict?.standard || 'Standart'} · <span className="text-muted-foreground font-normal">{userDict?.freeTier || 'Bepul tarif'}</span>
                  </p>
                )}
              </div>
            </div>

            <Link
              href={`/${lang}/dashboard/premium`}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                mySub?.isPro
                  ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border/60'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black font-black'
              }`}
            >
              {mySub?.isPro ? (userDict?.manageSub || 'Boshqarish') : (userDict?.upgradePro || 'Pro ga oʻtish 👑')}
            </Link>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-4 border border-border/40">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                {userDict?.mainGoal || 'Asosiy Maqsad'}
              </p>
              <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                {(userDict?.jlptCert || 'JLPT {level} Sertifikati').replace(
                  '{level}',
                  studyPlan?.targetLevel || 'N5'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Avatar Frames & Profile Decoration */}
      <ProfileFramesCard />

      {/* 3. Study Plan Section */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {planDict?.title || 'Shaxsiy Oʻrganish Rejasi'}
              </h3>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {studyPlan?.targetLevel || 'N5'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {planDict?.desc || 'Haftalik dars soati, kunlik reja va JLPT imtihoniga tayyorgarlik surʼati.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{planDict?.editPlan || 'Rejani tahrirlash'}</span>
          </button>
        </div>

        {studyPlan?.isConfigured && (
          <KitsuneMessage variant="level" level={studyPlan.targetLevel} messageKey="studying" showLevel />
        )}

        {/* Plan Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-secondary/30 p-4 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-4 w-4" />
              <span className="text-[11px] uppercase font-bold tracking-wider">{planDict?.targetLevel || 'Maqsad Daraja'}</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              JLPT {studyPlan?.targetLevel || 'N5'}
            </p>
            <p className="text-xs text-muted-foreground">
              {(planDict?.targetMonths || '{months} oylik reja').replace(
                '{months}',
                String(studyPlan?.targetMonths || 6)
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-4 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <Clock className="h-4 w-4" />
              <span className="text-[11px] uppercase font-bold tracking-wider">{planDict?.weeklyTime || 'Haftalik Vaqt'}</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              {studyPlan?.weeklyGoalHours || 4}{' '}
              <span className="text-sm font-medium text-muted-foreground">{planDict?.hoursPerWeek || 'soat / hafta'}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {(planDict?.dailyPace || 'Kuniga ~{mins} daqiqa').replace(
                '{mins}',
                String(studyPlan?.dailyMinutes || 35)
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/30 p-4 border border-border/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <Calendar className="h-4 w-4" />
              <span className="text-[11px] uppercase font-bold tracking-wider">{planDict?.jlptExam || 'JLPT Imtihoni'}</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-500">
              {examInfo.daysRemaining} <span className="text-sm font-medium">{planDict?.daysLeft || 'kun qoldi'}</span>
            </p>
            <p className="text-xs text-muted-foreground">{examInfo.formattedDate}</p>
          </div>
        </div>
      </div>

      {/* 3. Device Manager Section */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {devDict?.title || 'Ulangan Qurilmalar'}
              </h3>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
                {devices.length} / 3
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {devDict?.limitDesc || 'Bitta akkauntda bir vaqtning oʻzida maksimal 3 ta qurilma faol boʻlishi mumkin.'}
            </p>
          </div>
        </div>

        {/* Devices list */}
        <div className="space-y-3">
          {devices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-secondary/10 p-8 text-center text-muted-foreground">
              <p className="text-xs sm:text-sm">{devDict?.empty || 'Qurilmalar yuklanmoqda yoki mavjud emas...'}</p>
            </div>
          ) : (
            devices.map((device) => {
              const isPhone =
                device.os?.toLowerCase().includes('ios') ||
                device.os?.toLowerCase().includes('android');
              const Icon = isPhone ? Smartphone : Laptop;

              return (
                <div
                  key={device.deviceId}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                    device.isCurrent
                      ? 'border-primary/40 bg-primary/5 shadow-xs'
                      : 'border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                        device.isCurrent
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate">
                          {device.deviceName || devDict?.unknownDevice || 'Nomaʼlum qurilma'}
                        </p>
                        {device.isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{devDict?.currentDevice || 'Joriy qurilma'}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {device.browser} • {device.os} • IP: {device.ipAddress || '127.0.0.1'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                    <span className="text-xs text-muted-foreground">
                      {devDict?.active || 'Faol'}: {new Date(device.lastActiveAt).toLocaleDateString()}
                    </span>

                    {!device.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(device.deviceId)}
                        disabled={revokingId === device.deviceId}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{devDict?.revokeSession || 'Sessiyani yopish'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Account Actions */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 px-5 py-2.5 text-xs sm:text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          <span>{actDict?.logout || 'Tizimdan chiqish'}</span>
        </button>
      </div>
    </div>
  );
}