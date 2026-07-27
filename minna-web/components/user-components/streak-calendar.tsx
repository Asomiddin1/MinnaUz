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

  // Hydration xatosini oldini olish uchun
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
      
        // Backenddan nima kelayotganini ko'ramiz
        console.log("Backend javobi:", response.data);

        const dataArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        const datesArray = dataArray.map((dateString: string) => {
          // ENG XAVFSIZ USUL: faqat dastlabki 10 ta belgini qirqib olamiz ("2026-05-18")
          const dateOnly = dateString.substring(0, 10); 
          const [y, m, d] = dateOnly.split('-');
          return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0); 
        })
        
        // Tayyor sanalarni tekshiramiz (Invalid Date chiqmasligi kerak)
        console.log("Kalendarga tushadigan sanalar:", datesArray);

        setStreakDates(datesArray)
      } catch (error) {
        console.error("Streaklarni olishda xatolik:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreaks()
  }, [currentMonth, isMounted]) 

  // Bugungi kunni missed qilib qoymaslik va useCallback orqali optimallashtirish
  const isMissedDay = React.useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugungi kunning eng boshlanish vaqti

    // Agar sana bugun yoki kelajakda bo'lsa, uni hali o'tkazib yubormagan (missed emas)
    if (date >= today) return false;

    // Sanalarni solishtirish
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
      <Card className="w-full h-full p-1 border-none shadow-md dark:bg-slate-900 rounded-xl flex items-center justify-center">
        <div className="text-slate-400 text-sm">{t("loading")}</div>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full p-1 border-none shadow-md dark:bg-slate-900 rounded-xl relative py-4 flex justify-center items-center">
      <CardContent className="p-0 flex justify-center items-center">
        {isLoading && (
          <div className="absolute top-2 right-4 text-xs text-slate-400 animate-pulse">
            {t("syncing")}
          </div>
        )}

       <Calendar
  mode="single"
  month={currentMonth}
  onMonthChange={setCurrentMonth}
  // selected={selectedDate} <-- Olib tashlandi
  // onSelect={setSelectedDate} <-- Olib tashlandi
  modifiers={{ 
    streak: streakDates,
    missed: isMissedDay, 
  }}
  modifiersClassNames={{
    // rounded-full qildik, shunda chiroyli doira bo'ladi
    streak: "!bg-green-500 !text-white font-bold hover:!bg-green-600 focus:!bg-green-500 rounded-full",
    missed: "line-through text-slate-400 opacity-50 hover:bg-transparent", 
  }}
  className="rounded-md"
/>
      </CardContent>
    </Card>
  )
}