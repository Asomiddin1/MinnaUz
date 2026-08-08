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
    
    const interval = setInterval(fetchProgress, 300000)
    return () => clearInterval(interval)
  }, [status])

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3 animate-pulse">
          <div className="h-7 w-32 rounded-md bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-9 w-20 rounded bg-muted" />
        </div>
        <div className="mt-6 flex h-24 items-end gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-full bg-muted" style={{ height: "40px" }} />
              <div className="h-3 w-4 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-baseline justify-between">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-10 rounded bg-muted" />
          </div>
          <div className="mt-2 h-[6px] rounded-full bg-muted" />
        </div>
      </section>
    )
  }

  const chartData = data?.chart || []
  const todayFormatted = data?.today?.formatted || "0s 0d"

  // Parse formatted time like "1s 12d" to hours and minutes display
  const parseFormattedTime = (formatted: string) => {
    const hoursMatch = formatted.match(/(\d+)s/)
    const minutesMatch = formatted.match(/(\d+)d/)
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0
    return { hours, minutes }
  }

  const { hours, minutes } = parseFormattedTime(todayFormatted)

  const formatMinutes = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    if (h > 0) return `${h}s ${m}d`
    return `${m}d`
  }

  const todayDateString = new Date().toISOString().split("T")[0]

  // Hafta kunlari

  return (
    <section className="rounded-[28px] border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="headline text-[20px]">Umumiy progress</h2>
        <span className="rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground">
          Bu hafta
        </span>
      </div>

      <p className="mt-6 text-[13px] text-muted-foreground">
        Bugungi o'rganish vaqti
      </p>
      <p className="headline mt-1 text-[36px]">
        {hours > 0 && (
          <>
            {hours}
            <span className="text-[20px] text-muted-foreground">s </span>
          </>
        )}
        {minutes}
        <span className="text-[20px] text-muted-foreground">d</span>
      </p>

      <TooltipProvider delayDuration={100}>
        <div className="mt-6 flex h-24 items-end gap-2" aria-hidden>
          {chartData.map((item, idx) => {
            const isToday = item.date === todayDateString
            const height = Math.max(item.height_percent, 8)
            
            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <span className="flex flex-1 flex-col items-center gap-2 cursor-pointer">
                    <span
                      className={`w-full rounded-full transition-all duration-500 ${
                        isToday ? 'bg-primary' : 'bg-primary'
                      }`}
                      style={{ 
                        height: `${(height / 100) * 74}px`, 
                        opacity: isToday ? 1 : 0.4 + (height / 100) * 0.6 
                      }}
                    />
                    <span className={`text-[10px] ${
                      isToday ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}>
                      {item.day}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5}>
                  <p className="text-[11px] font-medium">
                    {item.day}, {formatMinutes(item.duration_minutes)}
                  </p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>

      {/* Progress bar qismi - agar kerak bo'lsa */}
      {data?.today?.minutes !== undefined && (
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-muted-foreground">
              Haftalik maqsad
            </span>
            <span className="tabular-nums">
              {Math.min(Math.round((data.today.minutes / (60 * 10)) * 100), 100)}%
            </span>
          </div>
          <span className="mt-2 block h-[6px] overflow-hidden rounded-full bg-muted">
            <span 
              className="block h-full rounded-full bg-foreground transition-all duration-500" 
              style={{ width: `${Math.min((data.today.minutes / (60 * 10)) * 100, 100)}%` }}
            />
          </span>
        </div>
      )}
    </section>
  )
}