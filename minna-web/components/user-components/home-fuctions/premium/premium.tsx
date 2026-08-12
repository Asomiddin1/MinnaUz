"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { userAPI } from "@/lib/api/user"
import { Crown, Check, MonitorSmartphone, Shield, ChevronDown, Sparkles, Minus } from "lucide-react"

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
      <div className="mt-12 grid gap-6 lg:grid-cols-3 max-w-[1000px] mx-auto">
        {plans.map((plan, i) => {
          const featured = i === 1
          const price = PRICES[i][yearly ? 1 : 0]
          const isCurrentPlan = (plan.name === "Premium" && isPremium) || (plan.name === "Bepul" && !isPremium)

          return (
            <section
              key={plan.name}
              className={`relative flex flex-col rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-1 ${
                featured
                  ? 'brand-panel shadow-[0_20px_60px_-20px_rgba(0,113,227,0.4)]'
                  : 'bg-card/40 backdrop-blur-md border border-border/50 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5'
              } ${isCurrentPlan && !featured ? 'ring-2 ring-primary/40' : ''}`}
            >
              {featured && (
                <div className="absolute inset-0 rounded-[32px] ring-1 ring-white/20 pointer-events-none" />
              )}
              {featured && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 px-4 py-1.5 text-[12px] font-bold text-white shadow-lg backdrop-blur-md">
                  Eng ommabop
                </span>
              )}

              {isCurrentPlan && !featured && (
                <span className="absolute right-6 top-8 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  <Check className="mr-1 inline h-3.5 w-3.5" />
                  Joriy
                </span>
              )}

              <h2 className={`headline text-[24px] ${featured ? 'text-white' : 'text-foreground'}`}>{plan.name}</h2>
              <p
                className={`mt-2 min-h-[44px] text-[14px] leading-relaxed ${
                  featured ? 'text-white/80' : 'text-muted-foreground'
                }`}
              >
                {plan.desc}
              </p>

              <div className="mt-6 flex flex-wrap items-baseline gap-1.5">
                <span className={`headline text-[40px] tracking-tight tabular-nums ${featured ? 'text-white' : 'text-foreground'}`}>
                  {price === 0 ? 'Bepul' : money.format(price)}
                </span>
                {price > 0 && (
                  <span className={`text-[15px] font-medium ${featured ? 'text-white/70' : 'text-muted-foreground'}`}>
                    so&apos;m {yearly ? '/yil' : '/oy'}
                  </span>
                )}
              </div>
              <p
                className={`mt-1.5 min-h-[20px] text-[13px] font-medium ${
                  featured ? 'text-white/60' : 'text-muted-foreground'
                }`}
              >
                {yearly && price > 0 &&
                  `${money.format(price)} so'm · yillik to'lov`}
              </p>

              <button
                type="button"
                disabled={isCurrentPlan}
                className={`mt-8 w-full rounded-2xl px-6 py-3.5 text-[15px] font-semibold transition-all duration-300 active:scale-[0.98] ${
                  featured && !isCurrentPlan
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                    : isCurrentPlan
                    ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md'
                }`}
              >
                {isCurrentPlan ? 'Sizning rejangiz' : featured ? 'Premiumga o\'tish' : "Tanlash"}
              </button>

              <ul className="mt-8 space-y-4 pt-4">
                {plan.highlights.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[15px] font-medium">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${featured ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <Check className={`h-3.5 w-3.5 ${featured ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <span className={featured ? 'text-white/90' : 'text-foreground/90'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-center text-[14px] font-medium text-muted-foreground">
        <Shield className="h-4.5 w-4.5 shrink-0 text-primary" />
        30 kunlik pulni qaytarish kafolati. Xotirjam xarid qiling.
      </p>

      {/* FEATURES COMPARISON TABLE (PRO DESIGN) */}
      <section className="mt-16 max-w-[900px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="headline text-[28px]">Ta&apos;riflarni batafsil solishtirish</h2>
          <p className="mt-2 text-muted-foreground">O&apos;zingiz uchun eng ma&apos;qul rejani tanlang</p>
        </div>
        
        <div className="overflow-hidden rounded-[32px] border border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-8 py-5 text-[14px] font-semibold text-foreground w-1/3">Imkoniyatlar</th>
                  <th className="px-6 py-5 text-center text-[15px] font-semibold text-foreground w-2/9">Bepul</th>
                  <th className="px-6 py-5 text-center text-[15px] font-bold text-primary w-2/9">Premium</th>
                  <th className="px-6 py-5 text-center text-[15px] font-semibold text-foreground w-2/9">Premium+</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[
                  ["Qurilmalar soni", "2 ta", "5 ta", "10 ta"],
                  ["Asosiy testlar (N5, N4)", "Ha", "Ha", "Ha"],
                  ["Murakkab testlar (N3, N2, N1)", "Yo'q", "Ha", "Ha"],
                  ["Reklamasiz ishlash", "Yo'q", "Ha", "Ha"],
                  ["Cheksiz kunlik mashqlar", "Yo'q", "Ha", "Ha"],
                  ["Maxsus JLPT tayyorgarlik kursi", "Yo'q", "Cheklangan", "Ha"],
                  ["VIP yordamchi (24/7)", "Yo'q", "Yo'q", "Ha"],
                ].map((row, r) => (
                  <tr key={row[0]} className="transition-colors duration-200 hover:bg-secondary/30">
                    <td className="px-8 py-5 text-[14px] font-medium text-foreground/80">{row[0]}</td>
                    {[1, 2, 3].map((c) => (
                      <td key={c} className="px-6 py-5 text-center">
                        {row[c] === "Ha" ? (
                          <div className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${c === 2 ? 'bg-primary/10' : 'bg-green-500/10'}`}>
                            <Check className={`h-3.5 w-3.5 ${c === 2 ? 'text-primary' : 'text-green-500'}`} />
                          </div>
                        ) : row[c] === "Yo'q" ? (
                          <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        ) : (
                          <span className={`text-[13.5px] font-medium ${c === 2 ? 'text-primary' : 'text-foreground/80'}`}>{row[c]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16 mb-12 max-w-[800px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="headline text-[28px]">Ko'p so'raladigan savollar</h2>
          <p className="mt-2 text-muted-foreground">Premium obuna haqida bilishingiz kerak bo&apos;lgan barcha narsalar.</p>
        </div>
        <ul className="overflow-hidden rounded-[28px] border border-border/50 bg-card/30 backdrop-blur-md shadow-sm">
          {[
            ["Premium rejaga qanday o'tish mumkin?", "Premium tugmasini bosing va to'lovni amalga oshiring. To'lov amalga oshirilgandan so'ng hisobingiz avtomatik yangilanadi."],
            ["To'lov qanday amalga oshiriladi?", "Bizning platforma orqali xavfsiz to'lov tizimi (Click, Payme) orqali karta bilan to'lashingiz mumkin."],
            ["Premium rejani bekor qilsam bo'ladimi?", "Ha, istalgan vaqtda bekor qilishingiz mumkin. Bekor qilgandan so'ng, joriy oy oxirigacha premium imkoniyatlardan foydalana olasiz."],
            ["Yillik to'lov qanday afzalliklarga ega?", "Yillik to'lovda siz 20% chegirmaga ega bo'lasiz va yil davomida premium imkoniyatlardan uzluksiz foydalanasiz."],
          ].map(([question, answer], i) => {
            const expanded = open === i
            return (
              <li key={question} className="border-b border-border/50 last:border-b-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-secondary/40"
                >
                  <span className="text-[15px] font-semibold text-foreground/90">{question}</span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      expanded ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <p className="overflow-hidden px-6 text-[14px] leading-relaxed text-muted-foreground">
                    <span className={`block ${expanded ? 'pb-6 pt-1' : ''}`}>{answer}</span>
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