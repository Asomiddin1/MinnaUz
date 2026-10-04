'use client'

import * as React from 'react'
import Link from 'next/link'
import { Crown, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import { Reveal } from './primitives'

interface Plan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  tag?: string
  isFree?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Bepul',
    price: "0 so'm",
    period: '/ doimiy',
    description: "Yapon tilini mustaqil boshlash va platforma bilan tanishish uchun.",
    features: [
      'Hiragana va Katakana toʻliq alifbosi',
      'JLPT N5 kirish darslari (cheklangan)',
      'Asosiy lugʻat va soʻz boyligi mashqlari',
      'Kunlik AI Sensei sinov savollari',
    ],
    isFree: true,
  },
  {
    id: 'monthly',
    name: 'Oylik Pro',
    price: "79 000 so'm",
    period: '/ oyiga',
    description: 'Yapon tilini intensiv va cheklovlarsiz boshlamoqchi boʻlganlar uchun.',
    features: [
      'Barcha JLPT N5, N4, N3 darslari',
      'Cheksiz AI Speaking (Kaiwa) mashgʻulotlari',
      'Barcha audio va video darslar',
      'Mock testlar va reyting tizimi',
      'Reklamalarsiz interfeys',
    ],
  },
  {
    id: 'annual',
    name: 'Yillik Premium',
    price: "499 000 so'm",
    period: '/ yiliga',
    description: 'N5 dan N2 gacha barcha bosqichlarni kafolat bilan zabt eting.',
    features: [
      'Barcha kurslar va yangi chiqadigan darslar',
      '40% gacha katta tejash',
      'Cheksiz AI Sensei tahlil va mashqlari',
      'VIP Yapon tili jamoasi aʼzoligi',
      'Yuklab olinadigan PDF qoʻllanmalar',
      'Yaponiyada oʻqish va ishlash konsultatsiyasi',
    ],
    popular: true,
    tag: 'Eng tejamkor',
  },
]

export default function Premium() {
  return (
    <section id="premium" className="border-t border-border py-24 sm:py-28">
      <div className="mx-auto max-w-[1120px] px-5 space-y-12">
        {/* Sarlavha qismi */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3.5 py-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
              <Crown className="h-4 w-4" />
              <span>MinnaUz Tariflari</span>
            </div>
            <h2 className="headline text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-tight text-foreground">
              Oʻzingizga mos tarifni tanlang
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              AI Speaking, toʻliq video darsliklar, interaktiv mashqlar va JLPT imtihonlariga tayyorgarlik.
            </p>
          </div>
        </Reveal>

        {/* Tarif Kartalari */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 90}>
              <div
                className={`relative flex h-full flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-yellow-500/50 bg-gradient-to-b from-card via-card to-yellow-500/5 shadow-xl ring-2 ring-yellow-500/20'
                    : 'border-border bg-card shadow-xs hover:border-primary/40'
                }`}
              >
                {plan.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-yellow-500 text-black text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    {plan.tag}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
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

                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{plan.period}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <div className="space-y-3 border-t border-border/60 pt-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tarif imkoniyatlari
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/60">
                  <Link
                    href={plan.isFree ? '/login' : `/dashboard/premium?plan=${plan.id}`}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                      plan.popular
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95'
                        : plan.isFree
                        ? 'bg-secondary text-foreground hover:bg-secondary/80 active:scale-95'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                    }`}
                  >
                    <span>{plan.isFree ? 'Bepul boshlash' : 'Obunani boshlash'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Ishonch bloki */}
        <Reveal delay={200}>
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Xavfsiz va tezkor toʻlov usullari</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Payme, Click, Uzum Bank va xalqaro Visa/Mastercard kartalari orqali lahzada faollashtiring.
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Payme</span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Click</span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Uzum</span>
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border">Visa</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}