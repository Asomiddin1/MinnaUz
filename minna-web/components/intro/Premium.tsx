"use client";
import { useState } from 'react'
import { Link } from '@/src/i18n/navigation'
import { CTA, Eyebrow, Reveal } from './primitives'

const t = {
  premium: {
    eyebrow: "Premium",
    heading: "O'z darajangizga mos rejani tanlang",
    monthly: "Oylik",
    yearly: "Yillik",
    free: "Bepul",
    perYear: "yil",
    perMonth: "oy",
    trial: "14 kun sinab ko'ring",
    choose: "Tanlash —",
    footnote: "Istalgan vaqtda bekor qilishingiz mumkin. Karta ma'lumotlari shart emas.",
    plans: [
      { note: "Asosiy funksiyalar", features: ["JLPT N5 testlar", "Asosiy lug'at", "Hiragana/Katakana darslari", "Haftalik 3 ta mashq"] },
      { note: "Eng mashhur tanlov", features: ["Barcha bepul funksiyalar", "Cheksiz JLPT testlar", "Video darslar", "AI talaffuz baholash", "Reklama yo'q"] },
      { note: "4 a'zo uchun", features: ["SuperMINNA barcha imkoniyatlari", "4 tagacha oila a'zosi", "Alohida profillar", "Guruh statistikasi"] },
    ],
  },
}

const plans = [
  { name: 'Free', monthly: 0, yearly: 0 },
  { name: 'SUPERMINNA', monthly: 79_000, yearly: 790_000, featured: true },
  { name: 'Family', monthly: 129_000, yearly: 1_290_000 },
]

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n).replace(/,/g, ' ')

export default function Premium() {
  const [yearly, setYearly] = useState(true)

  return (
    <section id="premium" className="border-t border-border py-28">
      <div className="mx-auto max-w-[1120px] px-5">
        <Reveal>
          <div className="text-center">
            <Eyebrow>{t.premium.eyebrow}</Eyebrow>
            <h2 className="headline mx-auto mt-4 max-w-[18ch] text-[clamp(2rem,5vw,3.6rem)]">
              {t.premium.heading}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-9 flex justify-center">
            <div className="inline-flex rounded-full border border-border p-1" role="group">
              {[
                [t.premium.monthly, false],
                [t.premium.yearly, true],
              ].map(([label, isYear]) => {
                const active = isYear === yearly
                return (
                  <button
                    key={String(label)}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setYearly(Boolean(isYear))}
                    className={`rounded-full px-5 py-1.5 text-[13px] font-medium transition-all duration-300 ${
                      active
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                    {isYear && <span className="ml-2 text-accent">−17%</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearly : plan.monthly
            const copy = t.premium.plans[i]
            return (
              <Reveal key={plan.name} delay={i * 90}>
                <div
                  className={`flex h-full flex-col rounded-[28px] border p-8 transition-all duration-500 hover:-translate-y-1 ${
                    plan.featured
                      ? 'brand-panel border-transparent shadow-[0_30px_70px_-40px_rgba(0,0,0,0.7)]'
                      : 'border-border bg-card'
                  }`}
                >
                  <p className="text-[13px] font-medium tracking-[0.2em] uppercase opacity-70">
                    {plan.name}
                  </p>
                  <p className="headline mt-5 text-[38px]">
                    {price === 0 ? t.premium.free : fmt(price)}
                    {price > 0 && (
                      <span className="ml-2 text-[14px] font-normal opacity-60">
                        UZS / {yearly ? t.premium.perYear : t.premium.perMonth}
                      </span>
                    )}
                  </p>
                  <p
                    className={`mt-2 text-[14px] ${plan.featured ? 'opacity-70' : 'text-muted-foreground'}`}
                  >
                    {copy.note}
                  </p>

                  <ul className="mt-8 space-y-3 text-[15px]">
                    {copy.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <span aria-hidden className={plan.featured ? 'opacity-70' : 'text-accent'}>
                          ✓
                        </span>
                        <span className={plan.featured ? 'opacity-90' : 'text-muted-foreground'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-2">
                    {plan.featured ? (
                      <Link
                        href="/auth/login"
                        className="inline-flex w-full items-center justify-center rounded-full bg-background px-6 py-2.5 text-[15px] font-medium text-foreground transition-opacity duration-300 hover:opacity-85"
                      >
                        {t.premium.trial}
                      </Link>
                    ) : (
                      <CTA href="/auth/login" variant="ghost">
                        {t.premium.choose} {plan.name}
                      </CTA>
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={200}>
          <p className="mx-auto mt-8 max-w-[60ch] text-center text-[13px] text-muted-foreground">
            {t.premium.footnote}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
