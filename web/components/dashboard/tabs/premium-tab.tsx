'use client';

import { KitsuneMessage } from '@/components/kitsune/kitsune-message';

import * as React from 'react';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Ticket,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Clock,
  Calendar,
  X,
  CreditCard,
  Gift,
  BookOpen,
} from 'lucide-react';
import {
  api,
  SubscriptionPlanItem,
  SubscriptionTier,
  PaymentProvider,
  MySubscriptionResponse,
  CheckoutResponse,
  AvailableDiscountItem,
} from '@/lib/api';

export function PremiumTab() {
  const [plans, setPlans] = React.useState<SubscriptionPlanItem[]>([]);
  const [mySub, setMySub] = React.useState<MySubscriptionResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [selectedTier, setSelectedTier] = React.useState<SubscriptionTier>('ANNUAL');
  const [selectedProvider, setSelectedProvider] = React.useState<PaymentProvider>('PAYME');

  // Promokod & Do'kon chegirmalari
  const [promoCodeInput, setPromoCodeInput] = React.useState('');
  const [appliedDiscount, setAppliedDiscount] = React.useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);
  const [codeValidating, setCodeValidating] = React.useState(false);
  const [codeError, setCodeError] = React.useState<string | null>(null);

  // To'lov jarayoni
  const [checkoutModalOpen, setCheckoutModalOpen] = React.useState(false);
  const [activeCheckout, setActiveCheckout] = React.useState<CheckoutResponse | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);

  // Ma'lumotlarni yuklash
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [plansData, subData] = await Promise.all([
        api.getSubscriptionPlans().catch(() => []),
        api.getMySubscription().catch(() => null),
      ]);

      if (plansData && plansData.length > 0) {
        setPlans(plansData);
      }
      setMySub(subData);
    } catch (e) {
      console.error('Failed to load subscription info:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Agar do'kondan vaucher orqali o'tilgan bo'lsa (sessionStorage)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedCode = sessionStorage.getItem('minna_apply_promo');
    if (storedCode) {
      setPromoCodeInput(storedCode);
      sessionStorage.removeItem('minna_apply_promo');
    }
  }, []);

  // Promokod tekshirish
  const handleApplyCode = async (codeToApply?: string) => {
    const code = (codeToApply || promoCodeInput).trim().toUpperCase();
    if (!code) {
      setCodeError('Iltimos, promokod yoki vaucher kodini kiriting');
      return;
    }

    setCodeValidating(true);
    setCodeError(null);

    try {
      const res = await api.validateSubscriptionCode(code, selectedTier);
      setAppliedDiscount({
        code: res.code,
        discountPercent: res.discountPercent,
        discountAmount: res.discountAmount,
        finalPrice: res.finalPrice,
      });
      setPromoCodeInput(res.code);
    } catch (err: any) {
      setCodeError(err?.message || 'Promokod yaroqsiz yoki eskirgan');
      setAppliedDiscount(null);
    } finally {
      setCodeValidating(false);
    }
  };

  // Promokodni bekor qilish
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setPromoCodeInput('');
    setCodeError(null);
  };

  // Tarif tanlanganda chegirmali narxni qayta hisoblash
  React.useEffect(() => {
    if (appliedDiscount) {
      handleApplyCode(appliedDiscount.code);
    }
  }, [selectedTier]);

  // Checkout boshlash
  const handleStartCheckout = async (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    try {
      const res = await api.checkoutSubscription({
        tier,
        provider: selectedProvider,
        promoCode: appliedDiscount?.code,
      });
      setActiveCheckout(res);
      setCheckoutModalOpen(true);
      setPaymentSuccess(false);
    } catch (err: any) {
      alert(err?.message || 'Toʻlovni boshlashda xatolik yuz berdi');
    }
  };

  // To'lovni simulyatsiya / tasdiqlash
  const handleConfirmPayment = async () => {
    if (!activeCheckout) return;
    setIsProcessingPayment(true);
    try {
      await api.simulatePayment(activeCheckout.transactionId);
      setPaymentSuccess(true);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Toʻlovni amalga oshirishda xatolik yuz berdi');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Obunani bekor qilish
  const handleCancelAutoRenew = async () => {
    if (!confirm('Obunaning avto-yangilanishini bekor qilmoqchimisiz? Joriy muddat tugaguncha darslardan foydalana olasiz.')) {
      return;
    }
    try {
      await api.cancelSubscription();
      await loadData();
      alert('Avto-yangilanish muvaffaqiyatli bekor qilindi.');
    } catch (err: any) {
      alert(err?.message || 'Xatolik yuz berdi');
    }
  };

  const currentPlan = plans.find((p) => p.tier === selectedTier) || plans[1] || plans[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 font-sans">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-card via-card to-yellow-500/10 p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 px-3.5 py-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
            <Crown className="h-4 w-4" />
            <span>MinnaUz Pro Obuna</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Yapon tilini toʻsiqlarsiz va cheklovlarsiz oʻrganing!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Barcha JLPT darajalaridagi darslar (N5–N2), AI jonli suhbat Sensei, barcha professional
            audio/video darsliklar va Mock testlar siz uchun ochiq.
          </p>
        </div>
      </div>

      <KitsuneMessage state="excited" messageKey="premium" />

      {/* 2. FOYDALANUVCHINING FAOL OBUNASI (AGAR PRO BO'LSA) */}
      {mySub?.isPro && mySub.subscription && (
        <div className="rounded-3xl border-2 border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 via-card to-card p-6 sm:p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                  Obuna faol
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <span>{mySub.subscription.plan?.name || mySub.subscription.tier}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-yellow-500" />
                  Qolgan vaqt:{' '}
                  <strong className="text-foreground font-bold">
                    {mySub.subscription.daysRemaining} kun
                  </strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Tugash sanasi:{' '}
                  <strong className="text-foreground">
                    {new Date(mySub.subscription.endDate).toLocaleDateString('uz-UZ')}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {mySub.subscription.autoRenew && (
                <button
                  type="button"
                  onClick={handleCancelAutoRenew}
                  className="px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                >
                  Avto-yangilanishni bekor qilish
                </button>
              )}
              <a
                href="#plans-section"
                className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black transition-all shadow-sm cursor-pointer"
              >
                Obunani uzaytirish
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. DO'KON CHEGIRMA VAUCHERLARI (AGAR BOR BO'LSA) */}
      {mySub?.availableDiscounts && mySub.availableDiscounts.length > 0 && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-black text-foreground">
              Sizda doʻkondan olingan faol chegirma vaucherlari bor!
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Tangalar doʻkonidan xarid qilgan vaucherlaringizni ushbu xaridda qoʻllab, mablagʻingizni
            tejang:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {mySub.availableDiscounts.map((disc) => {
              const isSelected = appliedDiscount?.code === disc.code;
              return (
                <div
                  key={disc.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'border-border/60 bg-card hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                        -{disc.discountPercent}% Chegirma
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-foreground mt-1.5">
                      {disc.code}
                    </p>
                  </div>

                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                      <Check className="h-4 w-4" />
                      Qoʻllandi
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCode(disc.code)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Qoʻllash
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PROMOKOD KIRITISH BLOKI */}
      <div className="rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Ticket className="h-4 w-4 text-primary" />
            Promokod yoki doʻkon vaucheri
          </span>
          <p className="text-xs text-muted-foreground">
            Maxsus chegirma kodingiz boʻlsa, uni kiriting va narxni arzonlashtiring.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {appliedDiscount ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-mono font-bold">
                {appliedDiscount.code} (-{appliedDiscount.discountPercent}%)
              </span>
              <button
                type="button"
                onClick={handleRemoveDiscount}
                className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                placeholder="Masalan: MINNA-10-ABC"
                className="px-3.5 py-2 rounded-xl border border-border bg-background text-xs font-mono font-bold uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary/40 w-48"
              />
              <button
                type="button"
                disabled={codeValidating}
                onClick={() => handleApplyCode()}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {codeValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Qoʻllash'}
              </button>
            </div>
          )}
        </div>
      </div>

      {codeError && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{codeError}</span>
        </div>
      )}

      {/* 5. TARIF KARTALARI */}
      <div id="plans-section" className="space-y-4">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-foreground">Oʻzingizga mos tarifni tanlang</h2>
          <p className="text-xs text-muted-foreground">
            Barcha tariflarda barcha yapon tili kurslari va AI imkoniyatlari toʻliq ochiladi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
          {/* BEPUL (FREE) TARIF KARTASI */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-foreground">Bepul (Free)</h3>
                <div className="p-2 rounded-xl bg-secondary text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="my-4 space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-foreground">0 soʻm</span>
                  <span className="text-xs text-muted-foreground font-medium">/ doimiy</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Yapon tilini mustaqil boshlash va platforma bilan tanishish uchun boshlangʻich tarif.
              </p>

              <div className="space-y-3 border-t border-border/60 pt-6 mt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Bepul imkoniyatlar
                </div>
                {[
                  'Hiragana va Katakana toʻliq alifbosi',
                  'Minna no Nihongo N5 (1–5 kirish darslari)',
                  'Asosiy lugʻat va grammatika mashqlari',
                  'Kunlik AI Sensei sinov savollari',
                  'Asosiy audio talaffuzlar',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60">
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-2xl bg-secondary text-muted-foreground font-bold text-xs cursor-default flex items-center justify-center gap-2"
              >
                <span>{mySub?.isPro ? 'Standart imkoniyatlar' : 'Joriy faol tarif'}</span>
              </button>
            </div>
          </div>

          {/* PULLIK PRO TARIFLAR */}
          {plans.map((plan) => {
            const isSelected = selectedTier === plan.tier;
            let displayPrice = `${plan.priceUzs.toLocaleString('uz-UZ')} so'm`;
            let hasDiscount = false;
            let discountedPrice = '';

            if (appliedDiscount) {
              hasDiscount = true;
              const discAmount = Math.round((plan.priceUzs * appliedDiscount.discountPercent) / 100);
              const finalVal = Math.max(0, plan.priceUzs - discAmount);
              discountedPrice = `${finalVal.toLocaleString('uz-UZ')} so'm`;
            }

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedTier(plan.tier)}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all cursor-pointer ${
                  plan.popular
                    ? 'border-yellow-500/60 bg-gradient-to-b from-card via-card to-yellow-500/5 shadow-xl ring-2 ring-yellow-500/20'
                    : isSelected
                      ? 'border-primary bg-card shadow-lg ring-2 ring-primary/20'
                      : 'border-border bg-card shadow-xs hover:border-primary/40'
                }`}
              >
                {plan.tag && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-500 text-black text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {plan.tag}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                    <div
                      className={`p-2 rounded-xl ${
                        plan.popular
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <Crown className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Narx qismi */}
                  <div className="my-4 space-y-1">
                    {hasDiscount ? (
                      <div>
                        <span className="text-xs line-through text-muted-foreground mr-2 font-semibold">
                          {displayPrice}
                        </span>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          -{appliedDiscount?.discountPercent}%
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl sm:text-4xl font-black text-emerald-500">
                            {discountedPrice}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            / {plan.durationDays >= 365 ? 'yiliga' : `${plan.durationDays} kun`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-foreground">
                          {displayPrice}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          / {plan.durationDays >= 365 ? 'yiliga' : `${plan.durationDays} kun`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Imkoniyatlar ro'yxati */}
                  <div className="space-y-3 border-t border-border/60 pt-6 mt-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Tarif imkoniyatlari
                    </div>

                    {/* Do'kondan sovg'a ramka */}
                    <div className="flex items-start gap-2.5 text-xs text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                      <Gift className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Sovgʻa: Doʻkondan &quot;Shogun Imperator Toji&quot; 👑 oltin ramkasi</span>
                    </div>

                    {((plan.features as string[]) || []).map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartCheckout(plan.tier);
                    }}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95'
                        : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95'
                    }`}
                  >
                    <span>Obunani faollashtirish</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. ISHONCH VA TO'LOV TIZIMLARI */}
      <div className="rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
        <div className="space-y-1">
          <div className="text-sm font-black text-foreground flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Xavfsiz va lahzali toʻlov kafolati</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Payme, Click, Uzum Bank va Visa orqali toʻlov qilganingiz zahoti obunangiz faollashadi.
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-black text-foreground">
          <span className="px-3.5 py-1.5 rounded-xl bg-secondary border border-border">Payme</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-secondary border border-border">Click</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-secondary border border-border">Uzum</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-secondary border border-border">Visa</span>
        </div>
      </div>

      {/* 7. TO'LOV MODALI (CHECKOUT MODAL) */}
      {checkoutModalOpen && activeCheckout && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {paymentSuccess ? (
              <div className="text-center space-y-5 py-4 animate-in zoom-in duration-300">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-emerald-500/10 text-emerald-500 mx-auto">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground">
                    Tabriklaymiz! Pro Faollashtirildi 🎉
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sizning toʻlovingiz qabul qilindi. Barcha darslar, AI Sensei va imkoniyatlar siz
                    uchun ochildi. +50 sovgʻa tangalari ham balansingizga qoʻshildi!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Darslarni boshlash 🚀
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-500/10 text-yellow-500 mx-auto mb-2">
                    <Crown className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-foreground">Toʻlovni amalga oshirish</h3>
                  <p className="text-xs text-muted-foreground">
                    Tanlangan tarif: <strong className="text-foreground">{activeCheckout.plan.name}</strong>
                  </p>
                </div>

                {/* Narx tafsilotlari */}
                <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Asl narx:</span>
                    <span>{activeCheckout.originalAmount.toLocaleString('uz-UZ')} soʻm</span>
                  </div>
                  {activeCheckout.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-500 font-bold">
                      <span>Chegirma ({activeCheckout.promoCode}):</span>
                      <span>-{activeCheckout.discountAmount.toLocaleString('uz-UZ')} soʻm</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-foreground font-black text-sm">
                    <span>Toʻlanadigan summa:</span>
                    <span className="text-primary text-base">
                      {activeCheckout.finalAmount.toLocaleString('uz-UZ')} soʻm
                    </span>
                  </div>
                </div>

                {/* To'lov usullari */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Toʻlov tizimini tanlang:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'PAYME' as PaymentProvider, name: 'Payme' },
                      { id: 'CLICK' as PaymentProvider, name: 'Click Up' },
                      { id: 'UZUM' as PaymentProvider, name: 'Uzum Bank' },
                      { id: 'STRIPE' as PaymentProvider, name: 'Visa / Card' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProvider(p.id)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          selectedProvider === p.id
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-card text-foreground hover:bg-secondary'
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasdiqlash tugmasi */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleConfirmPayment}
                    className="w-full py-3.5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Toʻlov tekshirilmoqda...</span>
                      </>
                    ) : (
                      <span>Toʻlovni tasdiqlash ({selectedProvider})</span>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Test rejimida toʻlov darhol hisobga olinadi va obuna ochiladi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}