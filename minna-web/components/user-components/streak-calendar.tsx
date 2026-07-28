"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { userAPI } from "@/lib/api/user"
import { useTranslations } from "next-intl"

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
    if (!isMounted) return;

    const fetchStreaks = async () => {
      setIsLoading(true)
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth() + 1 
        const response = await userAPI.getStreaks(year, month)
      
        const dataArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        const datesArray = dataArray.map((dateString: string) => {
          const dateOnly = dateString.substring(0, 10); 
          const [y, m, d] = dateOnly.split('-');
          return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0); 
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

  const isMissedDay = React.useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date >= today) return false;

    const isStreak = streakDates.some(
      (streakDate) => 
        streakDate.getFullYear() === date.getFullYear() &&
        streakDate.getMonth() === date.getMonth() &&
        streakDate.getDate() === date.getDate()
    );

    return !isStreak;
  }, [streakDates]);

  if (!isMounted) {
    return (
      <Card className="w-full h-full rounded-[28px] border-none bg-white shadow-sm dark:bg-slate-900 p-3 flex items-center justify-center">
        <div className="text-slate-400 text-sm">{t("loading")}</div>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full rounded-[28px] border-none bg-white shadow-sm dark:bg-slate-900 px-3 py-4 flex flex-col justify-between text-slate-900 dark:text-white">
      <div className="px-2 mb-1">
        <h3 className="text-lg font-bold">
          Kalendar
        </h3>
      </div>
      
      <CardContent className="p-0 relative flex flex-col justify-center items-center w-full flex-1">
        {isLoading && (
          <div className="absolute -top-5 right-2 text-[11px] text-slate-400 animate-pulse">
            {t("syncing")}
          </div>
        )}

        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          modifiers={{ 
            streak: streakDates,
            missed: isMissedDay, 
          }}
          modifiersClassNames={{
            streak: "!bg-[#00C853] !text-white font-bold rounded-full shadow-sm",
            missed: "line-through text-slate-400 dark:text-slate-500 opacity-90", 
          }}
          className="bg-transparent w-full flex justify-center font-medium [&_table]:w-full [&_td]:text-center [&_th]:text-center [&_button]:w-9 [&_button]:h-9 [&_button]:text-sm"
        />
      </CardContent>
    </Card>
  )
}