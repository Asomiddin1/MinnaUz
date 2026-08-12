"use client"

import React, { useEffect, useState } from "react"
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
  const { status } = useSession()
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
      <section className="rounded-[24px] border border-border bg-card p-3 px-4">
        <div className="flex items-center justify-between gap-3 animate-pulse mb-2">
          <div className="h-5 w-32 rounded-md bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
        <div className="mt-3 space-y-1">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-8 w-16 rounded bg-muted" />
        </div>
        <div className="mt-4 flex h-20 items-end justify-between gap-1 px-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-4 rounded-full bg-muted" style={{ height: "40px" }} />
              <div className="h-3 w-4 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-baseline justify-between">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-3 w-8 rounded bg-muted" />
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted" />
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

  return (
    <section className="rounded-[24px] border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h2 className="text-[14px] font-bold text-foreground">Umumiy progress</h2>
        <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-semibold text-foreground/80">
          Bu hafta
        </span>
      </div>

      <p className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
        Bugungi o&apos;rganish vaqti
      </p>
      <p className="mt-0 text-[26px] font-bold tracking-tight text-foreground flex items-baseline">
        {hours > 0 && (
          <>
            {hours}
            <span className="text-[14px] font-semibold text-muted-foreground/60 mx-0.5">s</span>
          </>
        )}
        {minutes}
        <span className="text-[14px] font-semibold text-muted-foreground/60 ml-0.5">d</span>
      </p>

      <TooltipProvider delayDuration={100}>
        <div className="mt-2 flex h-14 items-end justify-between px-1" aria-hidden>
          {chartData.map((item, idx) => {
            const isToday = item.date === todayDateString
            const height = Math.max(item.height_percent, 8) // minimum height so bar is visible

            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <span className="group flex flex-col items-center gap-1.5 cursor-pointer w-7">
                    <span className="relative flex w-3.5 flex-col justify-end h-[40px]">
                      {/* Background track for the bar */}
                      <span className="absolute inset-0 w-full rounded-full bg-secondary/60" />
                      {/* Active foreground bar */}
                      <span
                        className={`relative w-full rounded-full transition-all duration-500 ${isToday ? 'bg-primary shadow-sm' : 'bg-primary/50 group-hover:bg-primary/70'
                          }`}
                        style={{
                          height: `${(height / 100) * 40}px`,
                        }}
                      />
                    </span>
                    <span className={`text-[9px] ${isToday ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
                      }`}>
                      {item.day}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5} className="rounded-xl px-3 py-1.5 text-[11px] font-medium shadow-sm">
                  <span className="text-muted-foreground mr-1">{item.day}:</span>
                  {formatMinutes(item.duration_minutes)}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>

      {/* Progress bar qismi */}
      {data?.today?.minutes !== undefined && (
        <div className="mt-2.5 border-t border-border/60 pt-2.5">
          <div className="flex items-baseline justify-between text-[10px] mb-1">
            <span className="font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Haftalik maqsad
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {Math.min(Math.round((data.today.minutes / (60 * 10)) * 100), 100)}%
            </span>
          </div>
          <span className="block h-[4px] overflow-hidden rounded-full bg-secondary">
            <span
              className="block h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${Math.min((data.today.minutes / (60 * 10)) * 100, 100)}%` }}
            />
          </span>
        </div>
      )}
    </section>
  )
}