"use client"

import { useEffect, useCallback } from "react"
import { userAPI } from "@/lib/api/user"

/**
 * Kunlik check-in hook.
 * Har kuni foydalanuvchi birinchi marta sahifa ochganda
 * POST /user/check-in chaqiradi.
 * localStorage orqali deduplication — kuniga faqat 1 marta.
 *
 * @param onCheckIn - Check-in muvaffaqiyatli bo'lganda chaqiriladigan callback
 *                    (masalan, streak qiymatini yangilash uchun)
 */
export function useCheckIn(onCheckIn?: (streak: number) => void) {
  const performCheckIn = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10) // "2026-06-21"
    const lastCheckIn = localStorage.getItem("last_check_in")

    if (lastCheckIn === today) return // Bugun allaqachon check-in qilingan

    try {
      const response = await userAPI.checkIn()
      localStorage.setItem("last_check_in", today)

      // Agar callback berilgan bo'lsa va yangi check-in bo'lgan bo'lsa
      if (onCheckIn && response.data?.streak !== undefined) {
        onCheckIn(response.data.streak)
      }
    } catch (error) {
      console.error("Check-in xatolik:", error)
    }
  }, [onCheckIn])

  useEffect(() => {
    performCheckIn()
  }, [performCheckIn])
}
