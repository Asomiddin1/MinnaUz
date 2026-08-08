"use client";
import { useState } from 'react'
import { Eyebrow, Reveal } from './primitives'

const t = {
  levels: {
    eyebrow: "JLPT Darajalari",
    heading: "O'z darajangizni tanlang",
    kanji: "Kanji",
    words: "So'z",
    hours: "Soat",
    items: [
      { title: "N5 — Boshlang'ich daraja", blurb: "Hiragana, Katakana va eng asosiy lug'at. Yapon tilini birinchi marta o'rganayotganlar uchun ideal boshlang'ich nuqta." },
      { title: "N4 — Quyi o'rta daraja", blurb: "Kundalik muloqot va oddiy matnlarni tushunish. Asosiy grammatika va 1500 tagacha so'z boyitilib boradi." },
      { title: "N3 — O'rta daraja", blurb: "Ko'proq murakkab matnlar va muloqot. Yaponiyada ishlash yoki o'qish uchun minimal talab qilinadigan daraja." },
      { title: "N2 — Yuqori o'rta daraja", blurb: "Ilmiy va professional matnlar. Ko'plab yapon universitetlari va kompaniyalari shu darajani talab qiladi." },
      { title: "N1 — Ilg'or daraja", blurb: "Yapon tilini mukammal bilish. Gazeta, adabiy asarlar va murakkab hujjatlarni bemalol tushunish darajasi." },
    ],
  },
}

const stats = [
  { id: 'N5', kana: '初級', kanji: 103, words: 800, hours: 350 },
  { id: 'N4', kana: '初中級', kanji: 300, words: 1500, hours: 550 },
  { id: 'N3', kana: '中級', kanji: 650, words: 3750, hours: 900 },
  { id: 'N2', kana: '中上級', kanji: 1000, words: 6000, hours: 1600 },
  { id: 'N1', kana: '上級', kanji: 2000, words: 10000, hours: 3000 },
]

export default function Levels() {
  const [active, setActive] = useState(0)
  const level = stats[active]
  const copy = t.levels.items[active]

  return (
    <section id="levels" className="border-t border-border py-28">
      <div className="mx-auto max-w-[1120px] px-5">
        <Reveal>
          <Eyebrow>{t.levels.eyebrow}</Eyebrow>
          <h2 className="headline mt-4 max-w-[18ch] text-[clamp(2rem,5vw,3.6rem)]">
            {t.levels.heading}
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 flex flex-wrap gap-2" role="tablist" aria-label="JLPT">
            {stats.map((l, i) => (
              <button
                key={l.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`rounded-full border px-5 py-2 text-[14px] font-medium transition-all duration-300 ${
                  i === active
                    ? 'border-transparent bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {l.id}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-8 grid gap-10 rounded-[32px] border border-border bg-card p-9 lg:grid-cols-[1.35fr_1fr] lg:p-12">
            <div>
              <p className="font-jp text-[15px] text-primary">{level.kana}</p>
              <h3 className="headline mt-3 text-[clamp(1.7rem,3.4vw,2.6rem)]">{copy.title}</h3>
              <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground">
                {copy.blurb}
              </p>
            </div>

            <dl className="grid content-center gap-px overflow-hidden rounded-[20px] border border-border bg-border">
              {[
                [t.levels.kanji, level.kanji.toLocaleString()],
                [t.levels.words, level.words.toLocaleString()],
                [t.levels.hours, `≈ ${level.hours.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 bg-card px-6 py-5">
                  <dt className="text-[13px] uppercase tracking-[0.14em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="headline text-[24px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
