"use client";
import Image from 'next/image';
import { CTA, Reveal } from './primitives'

const t = {
  footer: {
    heading: "Bugun boshlang va yapon tilini o'rganing",
    cta1: "Bepul ro'yxatdan o'tish",
    cta2: "Darajalarni ko'rish",
    tagline: "Yapon tilini o'rganishning eng yaxshi platformasi — N5 dan N1 gacha.",
    rights: "© 2026 MinnaUz. Barcha huquqlar himoyalangan.",
    address: "Toshkent, O'zbekiston",
    columns: [
      { title: "Platforma", links: ["Darajalar", "Testlar", "Lug'at", "Video darslar"] },
      { title: "Kompaniya", links: ["Haqida", "Bog'lanish", "Maxfiylik siyosati"] },
      { title: "Yordam", links: ["FAQ", "Qo'llab-quvvatlash", "Jamoatchilik"] },
      { title: "Til", links: ["O'zbekcha", "Русский", "English"] },
    ],
  },
}

export default function Footer() {

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1120px] px-5 py-24 text-center">
        <Reveal>
          <p className="font-jp text-[15px] text-muted-foreground">はじめの一歩</p>
          <h2 className="headline mx-auto mt-4 max-w-[16ch] text-[clamp(2.2rem,6vw,4.2rem)]">
            {t.footer.heading}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CTA href="/auth/login">{t.footer.cta1}</CTA>
            <CTA href="#levels" variant="ghost">
              {t.footer.cta2}
            </CTA>
          </div>
        </Reveal>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-5">
          <div>
                <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <p className="mt-3 max-w-[26ch] text-[13px] leading-relaxed text-muted-foreground">
              {t.footer.tagline}
            </p>
            <div className="mt-5 flex gap-2">
              {['Telegram', 'Instagram'].map((s) => (
                <a
                  key={s}
                  href="#top"
                  className="rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors duration-300 hover:border-foreground/30 hover:text-foreground"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {t.footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-[14px] text-foreground/80 transition-colors duration-300 hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-6 text-[12px] text-muted-foreground">
          <p>{t.footer.rights}</p>
          <p>{t.footer.address}</p>
        </div>
      </div>
    </footer>
  )
}
