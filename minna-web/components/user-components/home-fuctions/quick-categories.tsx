"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { ClipboardList, Headphones, BookOpen, Languages, BarChart3 } from "lucide-react"
import { useRouter } from "@/src/i18n/navigation"
import { userAPI } from "@/lib/api/user" // O'zingizning userAPI yo'lingiz

export function QuickCategories() {
  const router = useRouter()
  const [stats, setStats] = React.useState({
    tests: 0,
    exercises: 0,
    grammar: 0,
    words: 0,
    statPercent: "0%"
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Backenddan real ma'lumotlarni tortib kelish
  React.useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // getProgress() API dan haftalik faollik ma'lumotlarini olamiz
        const response = await userAPI.getProgress()

        if (response?.data?.status === "success" && response.data?.data) {
          const progressData = response.data.data
          // chart data dan haftalik umumiy minutlarni hisoblaymiz
          const totalMinutes: number = progressData.chart?.reduce(
            (sum: number, d: { duration_minutes: number }) => sum + (d.duration_minutes || 0),
            0
          ) || 0
          setStats((prev) => ({
            ...prev,
            statPercent: `${Math.min(Math.round((totalMinutes / (60 * 10)) * 100), 100)}%`
          }))
        }
      } catch (error) {
        console.error("Statistikani olishda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  const categories = [
    {
      title: "Real testlar",
      desc: isLoading ? "Yuklanmoqda..." : `${stats.tests} ta yechilgan`,
      image: "/images/quick-categories/test.png",
      href: "/dashboard/jlpt",
    },
    {
      title: "Mashqlar",
      desc: isLoading ? "Yuklanmoqda..." : `${stats.exercises} ta bajarilgan`,
      image: "/images/quick-categories/mashqlar.png",
      href: "/dashboard/dokkai",
    },
    {
      title: "Grammatika",
      desc: isLoading ? "Yuklanmoqda..." : `${stats.grammar} ta o'rganilgan`,
      image: "/images/quick-categories/grammatika.png",
      href: "/dashboard/kanji",
    },
    {
      title: "So'zlar",
      desc: isLoading ? "Yuklanmoqda..." : `${stats.words} ta yodlangan`,
      image: "/images/quick-categories/suzlar.png",
      href: "/dashboard/dictionary",
    },
    {
      title: "Statistika",
      desc: isLoading ? "Yuklanmoqda..." : `Umumiy: ${stats.statPercent}`,
      image: "/images/quick-categories/statistika.png",
      href: "/dashboard/profile",
    },
  ]

  return (
    <Card className="w-full rounded-[28px] border-none bg-white shadow-sm dark:bg-slate-900 px-4 py-3 my-0">
      <div className="flex w-full items-center gap-2 md:gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className="flex shrink-0 items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group active:scale-95"
            >
              <div className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:rounded-xl">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover scale-[1.25] pointer-events-none" />
              </div>
              <div className="flex flex-col min-w-max pr-2">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight whitespace-nowrap">
                  {item.desc}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}