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
      icon: ClipboardList,
      iconBg: "bg-blue-500 text-white",
      href: "/dashboard/jlpt",
    },
    {
      title: "Mashqlar",
      desc: isLoading ? "Yuklanmoqda..." : `${stats.exercises} ta bajarilgan`,
      icon: Headphones,
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      href: "/dashboard/dokkai",
    },
    {
      title: "Grammatika",
      desc: isLoading ? "Yuklanmoqda..." : `${stats.grammar} ta o'rganilgan`,
      icon: BookOpen,
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      href: "/dashboard/kanji",
    },
    {
      title: "So'zlar",
      desc: isLoading ? "Yuklanmoqda..." : `${stats.words} ta yodlangan`,
      icon: Languages,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
      href: "/dashboard/dictionary",
    },
    {
      title: "Statistika",
      desc: isLoading ? "Yuklanmoqda..." : `Umumiy: ${stats.statPercent}`,
      icon: BarChart3,
      iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
      href: "/dashboard/profile",
    },
  ]

  return (
    <Card className="w-full rounded-[28px] border-none bg-white shadow-sm dark:bg-slate-900 px-4 py-3 my-0">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center w-full">
        {categories.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group active:scale-95"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105 ${item.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
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