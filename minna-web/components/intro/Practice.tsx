"use client";
import { useEffect, useState } from 'react'
import { Card, Eyebrow, Reveal } from './primitives'

const t = {
  practice: {
    eyebrow: "Mashq qilish",
    heading: "Har kuni o'rganing, har kuni ilgarilab boring",
    speech: {
      eyebrow: "Nutq tahlili",
      title: "AI talaffuz baholash",
      body: "Sun'iy intellekt sizning talaffuzingizni real vaqtda tahlil qiladi va 98% aniqlikda baholaydi.",
    },
    streak: {
      eyebrow: "Kunlik Streak",
      title: "Har kuni o'qish odati",
      strong: "21 kun streak",
      body: "— o'rganish davomiyligingizni kuzating va motivatsiyangizni yuqori saqlang.",
    },
    tests: {
      eyebrow: "Real JLPT Testlar",
      title: "Haqiqiy imtihon muhitida mashq",
      body: "N5 dan N2 gacha bo'lgan real JLPT formatidagi testlarni bizning platformamizda ishlang.",
      rows: ["Til bilimlari", "O'qish tushunish", "Eshitib tushunish"],
    },
    video: {
      eyebrow: "Video Darslar",
      title: "Ekspert o'qituvchilardan o'rganing",
      body: "Yapon tilini professional o'qituvchilar bilan qiziqarli video darslar orqali o'rganing.",
    },
  },
}

const sectionJp = ['言語知識', '読解', '聴解']
const sectionMax = [60, 60, 50]
const bars = [0.35, 0.62, 0.48, 0.81, 0.55, 0.92, 0.7, 0.44, 0.86, 0.6, 0.75, 0.4]

function SpeechCard() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setScore((s) => (s >= 98 ? 0 : Math.min(98, s + 2)))
    }, 40)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Card className="lg:col-span-3">
      <Eyebrow>{t.practice.speech.eyebrow}</Eyebrow>
      <h3 className="headline mt-4 text-[26px]">{t.practice.speech.title}</h3>
      <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-muted-foreground">
        {t.practice.speech.body}
      </p>

      <div className="mt-8 flex items-end gap-[6px]" aria-hidden>
        {bars.map((b, i) => (
          <span
            key={i}
            className="flex-1 rounded-full bg-primary transition-all duration-300"
            style={{ height: `${12 + b * 78 * (score / 98)}px`, opacity: 0.35 + b * 0.65 }}
          />
        ))}
      </div>

      <div className="mt-6 flex items-baseline justify-between border-t border-border pt-5">
        <span className="font-jp text-[20px]">はじめまして</span>
        <span className="headline text-[30px] tabular-nums text-primary">{score}%</span>
      </div>
    </Card>
  )
}

function StreakCard() {
  return (
    <Card className="lg:col-span-2">
      <Eyebrow>{t.practice.streak.eyebrow}</Eyebrow>
      <h3 className="headline mt-4 text-[26px]">{t.practice.streak.title}</h3>
      <div className="mt-8 grid grid-cols-7 gap-2" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-[7px] transition-colors duration-500"
            style={{
              backgroundColor:
                i % 9 === 3
                  ? 'var(--muted)'
                  : `color-mix(in srgb, var(--accent) ${25 + (i % 5) * 18}%, transparent)`,
            }}
          />
        ))}
      </div>
      <p className="mt-6 text-[15px] text-muted-foreground">
        <span className="text-foreground">{t.practice.streak.strong}</span> {t.practice.streak.body}
      </p>
    </Card>
  )
}

export default function Practice() {

  return (
    <section id="practice" className="border-t border-border py-28">
      <div className="mx-auto max-w-[1120px] px-5">
        <Reveal>
          <Eyebrow>{t.practice.eyebrow}</Eyebrow>
          <h2 className="headline mt-4 max-w-[20ch] text-[clamp(2rem,5vw,3.6rem)]">
            {t.practice.heading}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <SpeechCard />
          </Reveal>
          <Reveal delay={90} className="lg:col-span-2">
            <StreakCard />
          </Reveal>

          <Reveal delay={60} className="lg:col-span-2">
            <Card>
              <Eyebrow>{t.practice.tests.eyebrow}</Eyebrow>
              <h3 className="headline mt-4 text-[26px]">{t.practice.tests.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {t.practice.tests.body}
              </p>
              <div className="mt-7 space-y-3">
                {t.practice.tests.rows.map((label, i) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="font-jp w-16 text-[14px] text-muted-foreground">
                      {sectionJp[i]}
                    </span>
                    <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-foreground"
                        style={{ width: `${(sectionMax[i] / 60) * 82}%` }}
                      />
                    </span>
                    <span className="w-8 text-right text-[13px] tabular-nums text-muted-foreground">
                      {sectionMax[i]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-3">
            <Card className="!p-0">
              <div className="grid sm:grid-cols-[1.05fr_1fr]">
                <div className="p-8">
                  <Eyebrow>{t.practice.video.eyebrow}</Eyebrow>
                  <h3 className="headline mt-4 text-[26px]">{t.practice.video.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {t.practice.video.body}
                  </p>
                </div>
                <div className="relative min-h-[240px] bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1631599143468-b7d2d09820b6?w=900&h=900&fit=crop&auhref=format"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(100deg, var(--card) 0%, color-mix(in srgb, var(--card) 20%, transparent) 45%, transparent 70%)',
                    }}
                  />
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
