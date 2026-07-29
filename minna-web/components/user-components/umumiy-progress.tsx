"use client"

import React, { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { userAPI } from "@/lib/api/user"

interface ChartData {
  day: string
  date: string
  duration_minutes: number
  height_percent: number
}

interface ProgressData {
  today: {
    minutes: number
    formatted: string
  }
  chart: ChartData[]
}

export function UmumiyProgress() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return

    const fetchProgress = async () => {
      try {
        const res = await userAPI.getProgress()
        if (res.data?.status === "success") {
          setData(res.data.data)
        }
      } catch (error) {
        console.error("Progressni yuklashda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
    
    // Har 5 daqiqada ma'lumotlarni yangilab turish (ixtiyoriy)
    const interval = setInterval(fetchProgress, 300000)
    return () => clearInterval(interval)
  }, [session, status])

  // Bugungi va kechagi farqni hisoblash uchun sodda mantiq (agar kerak bo'lsa api dan olib kelish mumkin, hozircha o'chirib turamiz yoki "bugun" yozamiz)
  
  if (isLoading) {
    return (
      <div className="w-full rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-[180px] animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-7 gap-1.5 h-20 pt-1">
           {[...Array(7)].map((_, i) => (
             <div key={i} className="w-full bg-slate-200 dark:bg-slate-800 rounded-lg h-full"></div>
           ))}
        </div>
      </div>
    )
  }

  const chartData = data?.chart || []
  const todayFormatted = data?.today?.formatted || "0d"

  const formatMinutes = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    if (h > 0) return `${h} soat ${m} daqiqa`
    return `${m} daqiqa`
  }

  // Find today's index based on date or just use the end if it's not possible
  const todayDateString = new Date().toISOString().split("T")[0]

  return (
    <div className="w-full rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Umumiy progress
        </h3>
        <button className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          Bu hafta <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
            Bugungi o'rganish vaqti
          </p>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {todayFormatted}
          </span>
        </div>
      </div>

      {/* Diagramma ustunlari */}
      <TooltipProvider delayDuration={100}>
        <div className="grid grid-cols-7 gap-1.5 items-end h-20 pt-1">
          {chartData.map((item, idx) => {
            const isToday = item.date === todayDateString
            const height = Math.max(item.height_percent, 10) // minimal 10% balandlik ko'rinsin
            
            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 h-full justify-end group cursor-pointer relative">
                    <div 
                      className={`w-full max-w-[24px] rounded-lg transition-all duration-300 ${isToday ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 dark:group-hover:bg-slate-700'}`} 
                      style={{ height: `${height}%` }}
                    />
                    <span className={`text-[10px] font-semibold transition-colors ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                      {item.day}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5} className="bg-slate-900 text-white dark:bg-slate-800 border-none shadow-md">
                  <p className="text-[11px] font-semibold">{item.day}, {formatMinutes(item.duration_minutes)}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
    </div>
  )
}
