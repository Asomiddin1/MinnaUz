"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { userAPI } from "@/lib/api/user"
import { useTranslations } from "next-intl"

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

// Oyni to'liq haftalarga o'rab, 6x7 (yoki kerakli) grid tuzadi
function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const start = new Date(firstDayOfMonth)
  start.setDate(start.getDate() - start.getDay()) // orqaga, Yakshanbagacha

  const end = new Date(lastDayOfMonth)
  end.setDate(end.getDate() + (6 - end.getDay())) // oldinga, Shanbagacha

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
  const t = useTranslations("StreakCalendar")
  const [isMounted, setIsMounted] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [streakDates, setStreakDates] = React.useState<Date[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <Card className="w-full h-full rounded-[28px] border-none bg-white shadow-sm dark:bg-slate-900 p-3 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">{t("loading")}</div>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full rounded-[28px] border-none bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 px-4 py-4 flex flex-col justify-between text-slate-900 dark:text-white transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-lg font-bold tracking-tight">Kalendar</h3>

        {streakCountThisMonth > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#00C853]/10 px-2.5 py-1 text-xs font-semibold text-[#00A846] dark:text-[#4ADE80]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00C853]" />
            {streakCountThisMonth}
          </span>
        )}
      </div>

      <CardContent className="p-0 relative flex flex-col justify-center items-center w-full flex-1">
        {isLoading && (
          <div className="absolute -top-1 right-1 flex items-center gap-1 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-slate-300 dark:bg-slate-600" />
            {t("syncing")}
          </div>
        )}

        {/* Sarlavha + navigatsiya */}
        <div className="relative flex w-full items-center justify-center pb-3">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="Oldingi oy"
            className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm font-bold capitalize">
            {UZ_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Keyingi oy"
            className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Hafta kunlari */}
        <div className="grid w-full grid-cols-7">
          {UZ_WEEKDAYS.map((day, i) => (
            <div
              key={i}
              className="flex items-center justify-center pb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Kunlar gridi */}
        <div className="grid w-full grid-cols-7 gap-y-1">
          {calendarDays.map((date, i) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
            const isToday = isSameDay(date, today)
            const isStreak = isStreakDay(date)
            const isMissed = isMissedDay(date)

            return (
              <div key={i} className="flex items-center justify-center py-0.5">
                <button
                  type="button"
                  disabled={!isCurrentMonth}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-150",
                    !isCurrentMonth && "pointer-events-none text-slate-300 opacity-50 dark:text-slate-700",
                    isCurrentMonth && !isStreak && !isMissed && "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    isMissed && "text-slate-300 line-through decoration-1 dark:text-slate-600",
                    isStreak && "!bg-[#00C853] font-semibold text-white shadow-[0_2px_10px_rgba(0,200,83,0.35)] hover:!bg-[#00b84a]",
                    isToday && !isStreak && "ring-1 ring-inset ring-[#00C853] font-bold text-[#00A846] dark:text-[#4ADE80]",
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

        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00C853]" />
            Bajarilgan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-slate-300 dark:border-slate-600" />
            O&apos;tkazib yuborilgan
          </span>
        </div>
      </CardContent>
    </Card>
  )
}