"use client";
import { Eyebrow, Reveal } from './primitives'

const t = {
  kids: {
    eyebrow: "Bolalar uchun",
    heading: "Bolalar uchun qiziqarli yapon tili",
    body: "8 yoshdan 14 yoshgacha bo'lgan bolalar uchun maxsus mo'ljallangan darslar, o'yinlar va interaktiv mashqlar.",
    caption: "Hiragana, Katakana — birinchi qadam",
    items: [
      ["O'yin orqali o'rganish", "Har bir dars qiziqarli va interaktiv o'yinlar bilan boyitilib, bolalar zerikmasdan o'rganadi."],
      ["Moslashtirilgan tezlik", "Har bir bola o'z tezligida o'rganadi. Tizim avtomatik ravishda darajani moslashtiradi."],
      ["Ota-onalar nazorati", "Ota-onalar bolaning rivojlanishini kuzatib borishi va maqsadlar belgilashi mumkin."],
    ],
  },
}

export default function Kids() {

  return (
    <section id="kids" className="border-t border-border py-28">
      <div className="mx-auto grid max-w-[1120px] items-center gap-14 px-5 lg:grid-cols-[1fr_1.05fr]">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-muted">
            <img
              src="https://images.unsplash.com/photo-1759678444870-1f09f0d9e688?w=900&h=1100&fit=crop&auhref=format"
              alt=""
              className="h-[420px] w-full object-cover lg:h-[520px]"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-[20px] border border-border bg-glass p-5 backdrop-blur-2xl">
              <p className="font-jp text-[26px] leading-none">あ か さ た な</p>
              <p className="mt-2 text-[13px] text-muted-foreground">{t.kids.caption}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <Eyebrow>{t.kids.eyebrow}</Eyebrow>
          <h2 className="headline mt-4 text-[clamp(2rem,4.6vw,3.2rem)]">{t.kids.heading}</h2>
          <p className="mt-5 max-w-[50ch] text-[17px] leading-relaxed text-muted-foreground">
            {t.kids.body}
          </p>

          <ul className="mt-9 grid gap-px overflow-hidden rounded-[22px] border border-border bg-border">
            {t.kids.items.map(([title, body]) => (
              <li key={title} className="bg-background px-6 py-5">
                <p className="text-[15px] font-medium">{title}</p>
                <p className="mt-1 text-[14px] text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
