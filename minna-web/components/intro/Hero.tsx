"use client";
import { CTA, Reveal } from './primitives'
import { useScrollProgress } from './lib/hooks'

const t = {
  hero: {
    titleA: "Yapon tilini",
    titleB: "birgalikda o'rganing",
    sub: "JLPT N5 dan N2 gacha — interaktiv testlar, lug'atlar va AI talaffuz baholash bilan boshlang.",
    cta1: "Boshlash",
    cta2: "Mashqlarni ko'rish",
    stats: ["Faol o'quvchi", "JLPT darajasi", "Muvaffaqiyat", "Lug'at so'zi"],
  },
}

const kana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ']
const statValues = ['41,200', '5', '98%', '2,800+']

export default function Hero() {
  const progress = useScrollProgress()

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      {/* A quiet wash of light behind the headline — the whole ground stays flat otherwise. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at center, color-mix(in srgb, var(--primary) 22%, transparent), transparent 65%)',
          transform: `translate(-50%, ${progress * -120}px)`,
        }}
      />

      <div className="relative mx-auto max-w-[1120px] px-5">
        <Reveal>
          <p className="mb-6 text-center font-jp text-[15px] text-muted-foreground">
            日本語を、みんなで。
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="headline mx-auto max-w-[14ch] text-center text-[clamp(2.7rem,8.4vw,6.2rem)]">
            {t.hero.titleA} <span className="text-primary">N5</span>
            <br />
            {t.hero.titleB}
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="mx-auto mt-7 max-w-[48ch] text-center text-[19px] leading-relaxed text-muted-foreground">
            {t.hero.sub}
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <CTA href="/auth/login">{t.hero.cta1}</CTA>
            <CTA href="#practice" variant="ghost">
              {t.hero.cta2}
            </CTA>
          </div>
        </Reveal>

        {/* Kana rail — the hero's one moving part. */}
        <Reveal delay={340} className="mt-20">
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card py-14">
            <div
              className="flex justify-center gap-8 will-change-transform"
              style={{ transform: `translateX(${-progress * 260}px)` }}
            >
              {kana.map((c, i) => (
                <span
                  key={c}
                  className="font-jp text-[clamp(2.2rem,7vw,4.4rem)] leading-none transition-colors duration-500"
                  style={{
                    color: i === 4 ? 'var(--primary)' : 'var(--muted-foreground)',
                    opacity: 1 - Math.abs(i - 4) * 0.11,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-2 gap-y-8 border-t border-border pt-10 sm:grid-cols-4">
              {t.hero.stats.map((label, i) => (
                <div key={label} className="px-6 text-center">
                  <p className="headline text-[28px] sm:text-[34px]">{statValues[i]}</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
