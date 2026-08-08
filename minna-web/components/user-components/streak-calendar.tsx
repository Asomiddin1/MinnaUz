"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { userAPI } from "@/lib/api/user"

const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
]

const UZ_WEEKDAYS = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"]

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const start = new Date(firstDayOfMonth)
  start.setDate(start.getDate() - start.getDay())

  const end = new Date(lastDayOfMonth)
  end.setDate(end.getDate() + (6 - end.getDay()))

  const days: Date[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const d = new Date(cursor)
    d.setHours(12, 0, 0, 0)
    days.push(d)
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function StreakCalendar() {
  const [isMounted, setIsMounted] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [streakDates, setStreakDates] = React.useState<Date[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (!isMounted) return

    const fetchStreaks = async () => {
      setIsLoading(true)
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth() + 1
        const response = await userAPI.getStreaks(year, month)

        const dataArray = Array.isArray(response.data)
          ? response.data
          : response.data?.data || []

        const datesArray = dataArray.map((dateString: string) => {
          const dateOnly = dateString.substring(0, 10)
          const [y, m, d] = dateOnly.split("-")
          return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0)
        })

        setStreakDates(datesArray)
      } catch (error) {
        console.error("Streaklarni olishda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreaks()
  }, [currentMonth, isMounted])

  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const isStreakDay = React.useCallback(
    (date: Date) => streakDates.some((s) => isSameDay(s, date)),
    [streakDates]
  )

  const isMissedDay = React.useCallback(
    (date: Date) => {
      if (date >= today) return false
      return !isStreakDay(date)
    },
    [today, isStreakDay]
  )

  const calendarDays = React.useMemo(
    () => buildCalendarGrid(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  )

  const streakCountThisMonth = React.useMemo(
    () =>
      streakDates.filter(
        (d) =>
          d.getFullYear() === currentMonth.getFullYear() &&
          d.getMonth() === currentMonth.getMonth()
      ).length,
    [streakDates, currentMonth]
  )

  const goToPrevMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))

  const goToNextMonth = () =>
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  if (!isMounted) {
    return (
      <section className="rounded-[20px] border border-border bg-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-8 rounded bg-muted" />
          </div>
          <div className="h-4 w-28 rounded bg-muted mx-auto" />
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-7 w-7 rounded-full bg-muted mx-auto" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[20px] border border-border bg-card p-4">
      {/* Sarlavha qatori */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-foreground">Kalendar</h3>
        {streakCountThisMonth > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-green-400/15 px-2 py-0.5 text-[11px] font-semibold text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {streakCountThisMonth}
          </span>
        )}
      </div>

      {/* Loading indikator */}
      {isLoading && (
        <div className="flex items-center justify-center mb-2">
          <span className="text-[10px] text-muted-foreground animate-pulse">Yangilanmoqda...</span>
        </div>
      )}

      {/* Oy navigatsiyasi */}
      <div className="relative flex items-center justify-center mb-3">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Oldingi oy"
          className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span className="text-[12px] font-medium text-foreground">
          {UZ_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>

        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Keyingi oy"
          className="absolute right-0 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Hafta kunlari */}
      <div className="grid grid-cols-7 mb-1">
        {UZ_WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-[10px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Kunlar gridi */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {calendarDays.map((date, i) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
          const isToday = isSameDay(date, today)
          const isStreak = isStreakDay(date)
          const isMissed = isMissedDay(date)

          return (
            <div key={i} className="flex items-center justify-center">
              <button
                type="button"
                disabled={!isCurrentMonth}
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-all duration-150",
                  !isCurrentMonth && "pointer-events-none text-muted-foreground/30",
                  isCurrentMonth && !isStreak && !isMissed && !isToday && "text-foreground hover:bg-secondary",
                  isCurrentMonth && isMissed && "text-muted-foreground/50 line-through",
                  isStreak && "bg-green-400 font-semibold text-lime-950 shadow-sm",
                  isToday && !isStreak && "ring-1 ring-inset ring-lime-400 font-bold text-lime-600 dark:text-lime-400",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          Bajarilgan
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full border border-border" />
          O'tkazib yuborilgan
        </span>
      </div>
    </section>
  )
}