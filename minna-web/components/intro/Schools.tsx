"use client";
import { CTA, Eyebrow, Reveal } from './primitives'

const t = {
  schools: {
    eyebrow: "Maktablar uchun",
    heading: "O'quv markazingizni raqamli asrga olib kiring",
    demo: "Demo so'rash",
    overview: "Maktablar ko'rinishi",
    updated: "Yangilangan: Bugun",
    columns: ["Maktab nomi", "Shahar", "O'quvchilar", "Daraja", "Muvaffaqiyat"],
    cities: ["Toshkent", "Samarqand", "Buxoro", "Online"],
    mixed: "Aralash",
  },
}

const rows = [
  { name: 'Sakura Language Center', city: 0, learners: 128, track: 'N4 → N3', rate: 91 },
  { name: 'Nihongo Hub', city: 1, learners: 74, track: 'N5 → N4', rate: 88 },
  { name: 'Yaponcha Akademiya', city: 2, learners: 46, track: 'N3 → N2', rate: 79 },
  { name: 'Minna Online', city: 3, learners: 612, track: null, rate: 84 },
]

export default function Schools() {

  return (
    <section id="schools" className="border-t border-border py-28">
      <div className="mx-auto max-w-[1120px] px-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{t.schools.eyebrow}</Eyebrow>
              <h2 className="headline mt-4 max-w-[20ch] text-[clamp(2rem,4.6vw,3.2rem)]">
                {t.schools.heading}
              </h2>
            </div>
            <CTA href="#top" variant="ghost">
              {t.schools.demo}
            </CTA>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 overflow-hidden rounded-[28px] border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
              <p className="text-[13px] tracking-[0.16em] uppercase text-muted-foreground">
                {t.schools.overview}
              </p>
              <p className="text-[13px] text-muted-foreground">{t.schools.updated}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t.schools.columns.map((c) => (
                      <th key={c} className="px-6 py-4 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.name}
                      className="border-t border-border transition-colors duration-300 hover:bg-secondary"
                    >
                      <td className="px-6 py-5 text-[15px] font-medium">{row.name}</td>
                      <td className="px-6 py-5 text-[15px] text-muted-foreground">
                        {t.schools.cities[row.city]}
                      </td>
                      <td className="px-6 py-5 text-[15px] tabular-nums">{row.learners}</td>
                      <td className="px-6 py-5 text-[15px] text-muted-foreground">
                        {row.track ?? t.schools.mixed}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="h-[6px] w-24 overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${row.rate}%` }}
                            />
                          </span>
                          <span className="text-[14px] tabular-nums">{row.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
