"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { userAPI } from "@/lib/api/user"

export function ActivityTracker() {
  const { data: session, status } = useSession()
  const isActive = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status !== "authenticated") {
      return
    }

    const handleActivity = () => {
      isActive.current = true
    }

    // Harakatlarni kuzatish (throttle qilmasak ham bo'ladi, chunki faqat flag ni true qilamiz)
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("click", handleActivity)
    window.addEventListener("scroll", handleActivity)
    window.addEventListener("touchstart", handleActivity)

    // Har 1 daqiqada tekshirish va serverga yuborish
    intervalRef.current = setInterval(() => {
      if (isActive.current) {
        // Serverga ping yuborish
        userAPI.pingActivity(1).catch((err) => console.error("Activity ping xatosi:", err))

        // Yuborgach, keyingi daqiqa uchun faollikni reset qilish
        isActive.current = false
      }
    }, 60000) // 1 daqiqa

    return () => {
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("scroll", handleActivity)
      window.removeEventListener("touchstart", handleActivity)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [session, status])

  return null
}
