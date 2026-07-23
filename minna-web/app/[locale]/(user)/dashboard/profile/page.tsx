"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { userAPI } from "@/lib/api/user"
import {
  Crown,
  RefreshCcw,
  Camera,
  User as UserIcon,
  Coins,
  Flame,
  Smartphone,
  ChevronRight,
  History,
  CheckCircle2,
  XCircle,
  Monitor,
  LogOut,
  Laptop,
  Pencil,
  X,
  Check,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useCheckIn } from "@/hooks/useCheckIn"

interface User {
  id?: number
  name?: string
  email?: string
  avatar?: string
  image?: string
  role?: string
  coins?: number
  streak?: number
  is_premium?: boolean
  device_limit?: number
}

interface ExamResultSummary {
  id: number
  test_id: number
  test_title: string
  level: string
  score: number
  passed: boolean
  created_at: string
}

interface Device {
  id: number
  name: string
  last_used_at: string | null
  created_at: string
  is_current: boolean
}

// ============================================================
// EDIT NAME MODAL
// ============================================================
function EditNameModal({
  currentName,
  onClose,
  onSave,
}: {
  currentName: string
  onClose: () => void
  onSave: (name: string) => Promise<void>
}) {
  const [name, setName] = useState(currentName)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // ESC bilan yopish
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === currentName) {
      onClose()
      return
    }
    setIsSaving(true)
    await onSave(trimmed)
    setIsSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:border-slate-700/60 dark:bg-[#131929]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/15">
              <Pencil className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Ismni tahrirlash
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            To'liq ism
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={100}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-600 dark:bg-slate-800/60 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/20"
            placeholder="Ismingizni kiriting..."
          />
          <p className="mt-1.5 text-right text-xs text-slate-400">
            {name.length}/100
          </p>

          {/* Footer buttons */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving || name.trim().length < 2}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {isSaving ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [results, setResults] = useState<ExamResultSummary[]>([])
  const [devices, setDevices] = useState<Device[]>([])

  const [isFetching, setIsFetching] = useState(false)
  const [isFetchingResults, setIsFetchingResults] = useState(false)
  const [isDevicesLoading, setIsDevicesLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations("Profile")

  const handleCheckIn = useCallback((streak: number) => {
    setUser((prev) => (prev ? { ...prev, streak } : prev))
  }, [])

  useCheckIn(handleCheckIn)

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (!user) {
        setUser({
          name: session.user?.name || "",
          email: session.user?.email || "",
          avatar: session.user?.image || "",
          role: (session.user as any)?.role || "user",
          is_premium: (session.user as any)?.is_premium || false,
        })
      }
      fetchUser()
      fetchResults()
      fetchDevices()
    }
  }, [session, status])

  const fetchUser = async () => {
    try {
      setIsFetching(true)
      const response = await userAPI.getProfile()
      const backendUser = response.data.user || response.data
      setUser((prev) => ({ ...prev, ...backendUser }))
    } catch (err: any) {
      console.error(err)
      if (err?.response?.status === 401) signOut()
    } finally {
      setIsFetching(false)
    }
  }

  const fetchResults = async () => {
    try {
      setIsFetchingResults(true)
      const res = await userAPI.getMyResults()
      setResults(res.data || res.data?.data || [])
    } catch (err) {
      console.error("Natijalarni olishda xatolik:", err)
    } finally {
      setIsFetchingResults(false)
    }
  }

  const fetchDevices = async () => {
    try {
      setIsDevicesLoading(true)
      const res = await userAPI.getDevices()
      setDevices(res.data.data || [])
    } catch (err) {
      console.error("Qurilmalarni olishda xatolik:", err)
    } finally {
      setIsDevicesLoading(false)
    }
  }

  const handleLogoutDevice = async (tokenId: number) => {
    if (!confirm(t("confirmLogoutDevice"))) return
    try {
      await userAPI.logoutDevice(tokenId)
      setDevices(devices.filter((d) => d.id !== tokenId))
    } catch (err) {
      console.error("Qurilmadan chiqishda xatolik:", err)
    }
  }

  const handleLogoutOthers = async () => {
    if (!confirm(t("confirmLogoutOthers"))) return
    try {
      await userAPI.logoutOtherDevices()
      setDevices(devices.filter((d) => d.is_current))
    } catch (err) {
      console.error("Boshqa qurilmalardan chiqishda xatolik:", err)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert("Rasm hajmi 2MB dan oshmasligi kerak!")
      return
    }
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("avatar", file)
      const res = await userAPI.uploadAvatar(formData)
      if (res.data.success) {
        setUser((prev) => (prev ? { ...prev, avatar: res.data.avatar } : prev))
        await update({ image: res.data.avatar })
      }
    } catch (err: any) {
      console.error(err)
      const backendMessage = err?.response?.data?.message || JSON.stringify(err?.response?.data || err.message)
      alert(`Rasm yuklashda xatolik yuz berdi: ${backendMessage}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRevertAvatar = async () => {
    if (!confirm("Asl Google rasmingizga qaytmoqchimisiz?")) return
    try {
      setIsReverting(true)
      const res = await userAPI.revertAvatar()
      if (res.data.success) {
        setUser((prev) => (prev ? { ...prev, avatar: res.data.avatar } : prev))
        await update({ image: res.data.avatar })
      }
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.message || "Rasm qaytarishda xatolik yuz berdi")
    } finally {
      setIsReverting(false)
    }
  }

  const handleSaveName = async (newName: string) => {
    try {
      const res = await userAPI.updateName(newName)
      if (res.data.success) {
        setUser((prev) => (prev ? { ...prev, name: res.data.name } : prev))
        await update({ name: res.data.name })
        setShowNameModal(false)
      }
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.message || "Ism yangilashda xatolik yuz berdi")
    }
  }

  // ========================================
  // TO'G'RILANGAN FUNKSIYA
  // ========================================
  const getAvatarUrl = (url?: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    
    // NEXT_PUBLIC_API_URL muhit o'zgaruvchisidan API URL'ni olish
    // Masalan: https://api.minna.uz/api yoki http://localhost:8000/api
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    
    // API prefix'ni (/api) olib tashlab, root URL'ni olish
    // https://api.minna.uz/api -> https://api.minna.uz
    const rootUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "")
    
    // Root URL + storage yo'li
    // https://api.minna.uz + /storage/avatars/file.jpg = https://api.minna.uz/storage/avatars/file.jpg
    return `${rootUrl}${url}`
  }

  function timeAgo(dateString: string | null) {
    if (!dateString) return t("unknownDevice")
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return t("justNow")
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} ${t("minutesAgo")}`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ${t("hoursAgo")}`
    return date.toLocaleDateString()
  }

  const formatDeviceName = (ua: string) => {
    if (!ua) return t("unknownDevice")
    const lowerUA = ua.toLowerCase()
    if (
      lowerUA.includes("axios") ||
      lowerUA.includes("node") ||
      lowerUA.includes("guzzle") ||
      lowerUA.includes("postman")
    ) return t("systemDevice")

    let os = t("unknownOS")
    let browser = t("unknownBrowser")
    if (ua.includes("Windows")) os = "Windows"
    else if (ua.includes("Mac OS") || ua.includes("Macintosh")) os = "macOS"
    else if (ua.includes("iPhone")) os = "iPhone"
    else if (ua.includes("iPad")) os = "iPad"
    else if (ua.includes("Android")) os = "Android"
    else if (ua.includes("Linux")) os = "Linux"

    if (ua.includes("Edg")) browser = "Edge"
    else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera"
    else if (ua.includes("Chrome")) browser = "Chrome"
    else if (ua.includes("Firefox")) browser = "Firefox"
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"

    return `${os} • ${browser}`
  }

  const getDeviceIcon = (ua: string) => {
    const n = ua.toLowerCase()
    if (n.includes("iphone") || n.includes("android") || n.includes("ipad"))
      return <Smartphone className="h-5 w-5" />
    if (n.includes("mac") || n.includes("windows") || n.includes("linux"))
      return <Laptop className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  const handleMainLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mt-10 text-center text-slate-500 dark:text-slate-400">
        {t("notFound")}
      </div>
    )
  }

  const isPremium = user.is_premium || (session?.user as any)?.is_premium

  return (
    <>
      {/* Name Edit Modal */}
      {showNameModal && (
        <EditNameModal
          currentName={user.name || ""}
          onClose={() => setShowNameModal(false)}
          onSave={handleSaveName}
        />
      )}

      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6 lg:p-8">

        {/* ======================================= */}
        {/* 1. HEADER CARD                          */}
        {/* ======================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700/50 dark:bg-[#111827]">
          {/* Background accent */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl dark:bg-indigo-900/20" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-purple-100/40 blur-3xl dark:bg-purple-900/10" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-5 md:w-auto">

              {/* AVATAR */}
              <div className="group relative shrink-0">
                {user.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt="avatar"
                    className="h-24 w-24 rounded-2xl border-2 border-white object-cover shadow-md transition-all group-hover:border-indigo-200 dark:border-slate-700 dark:group-hover:border-indigo-700"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold text-white shadow-md">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Upload spinner overlay */}
                {isUploading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm dark:bg-slate-900/70">
                    <RefreshCcw className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Yangi rasm yuklash"
                  className="absolute -right-2 -bottom-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-700 hover:scale-110 active:scale-95 disabled:opacity-50 dark:border-slate-900 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* INFO */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                    <span className="truncate">{user.name}</span>
                    {isPremium && (
                      <Crown className="h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </h1>
                  <button
                    onClick={() => setShowNameModal(true)}
                    title="Ismni tahrirlash"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="mt-0.5 mb-3 truncate text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <UserIcon className="h-3.5 w-3.5" />
                    {user.role || "user"}
                  </span>

                  {isPremium && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                      <Crown className="h-3.5 w-3.5" />
                      Premium
                    </span>
                  )}

                  {/* Revert to Google avatar */}
                  {user.avatar && !user.avatar.startsWith("http") && (
                    <button
                      onClick={handleRevertAvatar}
                      disabled={isReverting}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                    >
                      <RefreshCcw className={`h-3.5 w-3.5 ${isReverting ? "animate-spin" : ""}`} />
                      Google rasmiga qaytish
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex w-full shrink-0 flex-col gap-3 md:w-auto md:flex-row">
              <button
                onClick={fetchUser}
                disabled={isFetching}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 md:w-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                {t("refreshProfile")}
              </button>
              <button
                onClick={handleMainLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 md:w-auto dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* 2. STATS GRID                           */}
        {/* ======================================= */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Coins */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-[#111827]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {user.coins !== undefined ? user.coins : <span className="animate-pulse text-slate-400">…</span>}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("coins")}</p>
            </div>
          </div>

          {/* Streak */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-[#111827]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-400/10 dark:text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {user.streak !== undefined ? user.streak : <span className="animate-pulse text-slate-400">…</span>}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("streak")}</p>
            </div>
          </div>

          {/* Devices */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-[#111827]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {devices.length}
                <span className="text-base font-normal text-slate-400">
                  {" "}/ {isPremium ? 5 : 2}
                </span>
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("devices")}</p>
            </div>
          </div>

          {/* Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-[#111827]">
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide ${isPremium ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                {isPremium ? <Crown className="h-3.5 w-3.5" /> : null}
                {isPremium ? t("premium") : t("free")}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {isPremium ? t("activePlan") : t("basicPlan")}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("plan")}</p>
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* 3. BOTTOM GRID: Results + Devices       */}
        {/* ======================================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Test Results History */}
          <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700/50 dark:bg-[#111827]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <History className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                {t("history")}
              </h2>
              <button
                onClick={fetchResults}
                disabled={isFetchingResults}
                className="text-sm text-slate-400 transition-colors hover:text-indigo-600 disabled:opacity-50 dark:hover:text-indigo-400"
              >
                {isFetchingResults ? t("refreshing") : t("refresh")}
              </button>
            </div>

            {results.length === 0 && !isFetchingResults ? (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <History className="mb-3 h-10 w-10 text-slate-200 dark:text-slate-700" />
                <p className="text-sm text-slate-400 dark:text-slate-500">{t("noHistory")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/60"
                    onClick={() =>
                      (window.location.href = `/dashboard/jlpt/${result.test_id}/result/${result.id}`)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${result.passed ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400"}`}>
                        {result.passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {result.test_title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{result.level}</span>
                          <span>•</span>
                          <span>{new Date(result.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${result.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                        {result.score}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Manager */}
          <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700/50 dark:bg-[#111827]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Monitor className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                {t("devicesTitle")}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  {devices.length} / {isPremium ? 5 : 2}
                </span>
                <button
                  onClick={fetchDevices}
                  disabled={isDevicesLoading}
                  className="text-slate-400 transition-colors hover:text-indigo-600 disabled:opacity-50 dark:hover:text-indigo-400"
                >
                  <RefreshCcw className={`h-4 w-4 ${isDevicesLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {isDevicesLoading && devices.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-10">
                <RefreshCcw className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className={`flex items-center justify-between rounded-xl border p-4 ${
                      device.is_current
                        ? "border-indigo-200/60 bg-indigo-50/50 dark:border-indigo-700/40 dark:bg-indigo-500/10"
                        : "border-slate-100 bg-white dark:border-slate-700/50 dark:bg-slate-800/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${device.is_current ? "bg-white text-indigo-600 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                        {getDeviceIcon(device.name || "")}
                      </div>
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatDeviceName(device.name)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {device.is_current
                            ? t("currentSession")
                            : `${t("lastActivity")} ${timeAgo(device.last_used_at)}`}
                        </p>
                      </div>
                    </div>

                    {device.is_current ? (
                      <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                        {t("active")}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleLogoutDevice(device.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                        title={t("logout")}
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {devices.length > 1 && (
                  <div className="mt-4 border-t border-slate-100 pt-4 text-center dark:border-slate-700/50">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t("logoutOthersDesc")}
                    </p>
                    <button
                      onClick={handleLogoutOthers}
                      className="mt-3 w-full rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    >
                      {t("logoutOthersBtn")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}