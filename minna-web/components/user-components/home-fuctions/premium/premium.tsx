"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { userAPI } from "@/lib/api/user"
import { Crown, Check, MonitorSmartphone, Shield, ChevronDown, Sparkles } from "lucide-react"

type User = {
  id?: number
  name?: string
  email?: string
  is_premium?: boolean
  device_limit?: number
}

const plans = [
  {
    name: "Bepul",
    price: 0,
    limit: 2,
    desc: "Asosiy foydalanuvchilar uchun",
    features: ["2 ta qurilma", "Cheklangan imkoniyatlar", "Reklamalar"],
    highlights: ["Asosiy testlar", "Kunlik mashqlar", "2 ta qurilma"],
  },
  {
    name: "Premium",
    price: 49000,
    limit: 5,
    desc: "Talabalar va faol foydalanuvchilar uchun",
    features: ["5 ta qurilma", "Reklamalar yo'q", "Tezkor yordam", "Barcha testlar"],
    highlights: ["Barcha testlar", "Cheksiz mashqlar", "5 ta qurilma", "Premium kontent"],
  },
  {
    name: "Premium+",
    price: 79000,
    limit: 10,
    desc: "Professional va biznes foydalanuvchilar uchun",
    features: ["10 ta qurilma", "Reklamalar yo'q", "VIP yordam", "Maxsus kontent"],
    highlights: ["Barcha testlar", "Cheksiz mashqlar", "10 ta qurilma", "VIP yordam", "Maxsus kontent"],
  },
]

const PRICES: [number, number][] = [
  [0, 0],
  [49000, 39000],
  [79000, 63000],
]

export default function PremiumPlans() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [yearly, setYearly] = useState(true)
  const [open, setOpen] = useState<number | null>(0)

  const isPremium = user?.is_premium || (session?.user as any)?.is_premium || false

  useEffect(() => {
    if (status === "authenticated" && session?.user && !user) {
      setUser({
        name: session.user.name || "",
        email: session.user.email || "",
        is_premium: (session.user as any)?.is_premium || false,
      })
    }
    if (status === "authenticated") {
      fetchUser()
    }
  }, [session, status])

  const fetchUser = async () => {
    try {
      setIsFetching(true)
      const res = await userAPI.getProfile()
      const backendUser = res.data.user || res.data
      setUser((prev) => ({ ...prev, ...backendUser }))
    } catch (err) {
      console.error("Profile yuklashda xatolik:", err)
    } finally {
      setIsFetching(false)
    }
  }

  const money = new Intl.NumberFormat('uz-UZ')

  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Crown className="h-8 w-8 animate-spin text-[#007AFF]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1080px] space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <header className="text-center">
        <h1 className="headline mt-4 text-[clamp(2rem,4.5vw,3rem)]">Premium reja</h1>
        <p className="mx-auto mt-3 max-w-[50ch] text-[16px] leading-relaxed text-muted-foreground">
          Hisobingizni yangilang va ko'proq imkoniyatlarga ega bo'ling
        </p>

        {/* Toggle: Monthly / Yearly */}
        <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-border p-1">
          {[false, true].map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={value === yearly}
              onClick={() => setYearly(value)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition-all duration-300 ${
                value === yearly
                  ? 'bg-foreground font-medium text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {value ? 'Yillik' : 'Oylik'}
              {value && (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    color: '#007AFF',
                    backgroundColor: 'rgba(0, 122, 255, 0.15)',
                  }}
                >
                  -20%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Status Badge */}
        <div className="mt-6">
          {isPremium ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-5 py-2 text-[13px] font-semibold text-green-600 shadow-sm transition-colors dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
              <Check className="h-4 w-4" /> Siz Premium foydalanuvchisiz
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-border bg-secondary px-5 py-2 text-[13px] font-medium text-muted-foreground shadow-sm">
              Bepul reja
            </span>
          )}
        </div>
      </header>

      {/* PLANS GRID */}
      <div className="mt-9 grid gap-5 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const featured = i === 1
          const price = PRICES[i][yearly ? 1 : 0]
          const isCurrentPlan = (plan.name === "Premium" && isPremium) || (plan.name === "Bepul" && !isPremium)

          return (
            <section
              key={plan.name}
              className={`relative flex flex-col rounded-[28px] p-7 transition-all duration-300 ${
                featured
                  ? 'brand-panel border border-transparent shadow-[0_24px_50px_-32px_rgba(0,0,0,0.45)]'
                  : 'border border-border bg-card'
              } ${isCurrentPlan && !featured ? 'ring-2 ring-[#007AFF]/30' : ''}`}
            >
              {featured && (
                <span className="absolute right-6 top-7 rounded-full bg-background/20 px-3 py-1 text-[11px] font-medium">
                  Eng ommabop
                </span>
              )}

              {isCurrentPlan && (
                <span className="absolute left-6 top-7 rounded-full bg-[#007AFF]/10 px-3 py-1 text-[11px] font-medium text-[#007AFF]">
                  <Check className="mr-1 inline h-3 w-3" />
                  Joriy
                </span>
              )}

              <h2 className="headline text-[22px]">{plan.name}</h2>
              <p
                className={`mt-2 min-h-[40px] text-[13px] leading-relaxed ${
                  featured ? 'opacity-75' : 'text-muted-foreground'
                }`}
              >
                {plan.desc}
              </p>

              <p className="mt-6 flex flex-wrap items-baseline gap-1.5">
                <span className="headline text-[36px] tabular-nums">
                  {price === 0 ? 'Bepul' : money.format(price)}
                </span>
                {price > 0 && (
                  <span className={`text-[14px] ${featured ? 'opacity-70' : 'text-muted-foreground'}`}>
                    so'm
                    {yearly ? '/yil' : '/oy'}
                  </span>
                )}
              </p>
              <p
                className={`mt-1 min-h-[18px] text-[12px] ${
                  featured ? 'opacity-60' : 'text-muted-foreground'
                }`}
              >
                {yearly && price > 0 &&
                  `${money.format(price)} so'm · yillik to'lov`}
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[12px] font-medium text-muted-foreground">
                <MonitorSmartphone className="h-3.5 w-3.5" /> Qurilmalar: {plan.limit}
              </div>

              <button
                type="button"
                disabled={isCurrentPlan}
                className={`mt-6 rounded-full px-5 py-3 text-[14px] font-medium transition-all duration-300 active:scale-[0.98] ${
                  featured && !isCurrentPlan
                    ? 'bg-background text-foreground hover:opacity-90'
                    : isCurrentPlan
                    ? 'border border-border bg-secondary/50 text-muted-foreground cursor-not-allowed'
                    : 'border border-border hover:bg-secondary disabled:pointer-events-none disabled:opacity-50'
                }`}
              >
                {isCurrentPlan ? 'Joriy reja' : featured ? 'Yangilash' : "O'zgartirish"}
              </button>

              <ul className="mt-7 space-y-3 border-t border-current/10 pt-6">
                {plan.highlights.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[14px]">
                    <Check
                      className={`mt-[3px] h-4 w-4 shrink-0 ${featured ? 'text-[#007AFF]' : 'text-accent'}`}
                    />
                    <span className={featured ? '' : 'text-foreground/85'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 text-center text-[13px] text-muted-foreground">
        <Shield className="h-4 w-4 shrink-0" />
        30 kunlik pulni qaytarish kafolati
      </p>

      {/* FEATURES COMPARISON TABLE */}
      <section className="mt-10 overflow-hidden rounded-[28px] border border-border bg-card">
        <div className="border-b border-border p-6">
          <h2 className="headline text-[20px]">Xususiyatlarni solishtirish</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-4 font-medium">Xususiyat</th>
                <th className="px-6 py-4 text-center font-medium">Bepul</th>
                <th className="px-6 py-4 text-center font-medium">Premium</th>
                <th className="px-6 py-4 text-center font-medium">Premium+</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Qurilmalar soni", "2", "5", "10"],
                ["Reklamalar", "Bor", "Yo'q", "Yo'q"],
                ["Barcha testlar", "Yo'q", "Ha", "Ha"],
                ["Cheksiz mashqlar", "Yo'q", "Ha", "Ha"],
                ["Premium kontent", "Yo'q", "Cheklangan", "Ha"],
                ["VIP yordam", "Yo'q", "Yo'q", "Ha"],
                ["Maxsus imtiyozlar", "Yo'q", "Ha", "Ha"],
              ].map((row, r) => (
                <tr
                  key={row[0]}
                  className="border-t border-border transition-colors duration-300 hover:bg-secondary"
                >
                  <td className="px-6 py-4 text-[14px] font-medium">{row[0]}</td>
                  {[1, 2, 3].map((c) => (
                    <td key={c} className="px-6 py-4 text-center">
                      {row[c] === "Ha" ? (
                        <Check className="mx-auto h-[18px] w-[18px] text-[#007AFF]" />
                      ) : row[c] === "Yo'q" ? (
                        <span className="text-muted-foreground" aria-label="—">
                          —
                        </span>
                      ) : (
                        <span className="text-[13px] text-foreground">{row[c]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10 mb-4">
        <h2 className="headline text-[20px]">Ko'p so'raladigan savollar</h2>
        <ul className="mt-4 overflow-hidden rounded-[24px] border border-border bg-card">
          {[
            ["Premium rejaga qanday o'tish mumkin?", "Premium tugmasini bosing va to'lovni amalga oshiring. To'lov amalga oshirilgandan so'ng hisobingiz avtomatik yangilanadi."],
            ["To'lov qanday amalga oshiriladi?", "Bizning platforma orqali xavfsiz to'lov tizimi orqali karta yoki boshqa to'lov usullari bilan to'lashingiz mumkin."],
            ["Premium rejani bekor qilsam bo'ladimi?", "Ha, istalgan vaqtda bekor qilishingiz mumkin. Bekor qilgandan so'ng, joriy oy oxirigacha premium imkoniyatlardan foydalana olasiz."],
            ["Yillik to'lov qanday afzalliklarga ega?", "Yillik to'lovda siz 20% chegirmaga ega bo'lasiz va yil davomida premium imkoniyatlardan foydalanasiz."],
          ].map(([question, answer], i) => {
            const expanded = open === i
            return (
              <li key={question} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-secondary"
                >
                  <span className="text-[15px] font-medium">{question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-500 ${
                    expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <p className="overflow-hidden px-6 text-[14px] leading-relaxed text-muted-foreground">
                    <span className={`block ${expanded ? 'pb-5' : ''}`}>{answer}</span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}