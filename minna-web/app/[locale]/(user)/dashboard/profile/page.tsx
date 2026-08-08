"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { userAPI, getAvatarUrl } from "@/lib/api/user"
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

// Apple primary blue
const APPLE_BLUE = "#007AFF"

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-border bg-glass p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="rounded-[24px] bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="headline text-[20px]">Ismni tahrirlash</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors duration-300 hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
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
              className="w-full rounded-[16px] border border-border bg-secondary/50 px-4 py-3 text-[14px] text-foreground outline-none transition-all duration-300 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
              placeholder="Ismingizni kiriting..."
            />
            <p className="mt-1.5 text-right text-[12px] text-muted-foreground">
              {name.length}/100
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-border px-6 py-2.5 text-[13px] font-medium transition-colors duration-300 hover:bg-secondary"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isSaving || name.trim().length < 2}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#007AFF] py-2.5 text-[13px] font-medium text-white transition-all duration-300 hover:bg-[#0055CC] disabled:opacity-50"
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
        window.location.reload()
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
        window.location.reload()
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
        <RefreshCcw className="h-8 w-8 animate-spin text-[#007AFF]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mt-10 text-center text-muted-foreground">
        {t("notFound")}
      </div>
    )
  }

  const isPremium = user.is_premium || (session?.user as any)?.is_premium
  const isAdmin = user.role === "admin" || user.role === "Admin"

  return (
    <>
      {showNameModal && (
        <EditNameModal
          currentName={user.name || ""}
          onClose={() => setShowNameModal(false)}
          onSave={handleSaveName}
        />
      )}

      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        {/* ======================================= */}
        {/* 1. IDENTITY CARD                        */}
        {/* ======================================= */}
        <section className="relative rounded-[28px] border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-6">
            {/* AVATAR - kattaroq */}
            <div className="group relative shrink-0">
              {user.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt="avatar"
                  className="h-24 w-24 rounded-full border-2 border-border object-cover transition-all duration-300 group-hover:border-[#007AFF]"
                />
              ) : (
                <span className="headline grid h-24 w-24 shrink-0 place-items-center rounded-full bg-primary text-[32px] text-primary-foreground">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}

              {isUploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                  <RefreshCcw className="h-6 w-6 animate-spin text-white" />
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -right-1 -bottom-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-[#007AFF] text-white shadow-md transition-all duration-300 hover:bg-[#0055CC] hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="headline text-[24px]">{user.name}</h2>
                <button
                  onClick={() => setShowNameModal(true)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 hover:bg-secondary"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <p className="mt-1 text-[14px] text-muted-foreground">{user.email}</p>

              {/* Google rasmiga qaytish tugmasi */}
              {user.avatar && !user.avatar.startsWith("http") && (
                <div className="mt-3">
                  <button
                    onClick={handleRevertAvatar}
                    disabled={isReverting}
                    className="rounded-full bg-[#007AFF]/10 px-3 py-1.5 text-[12px] font-medium text-[#007AFF] transition-all duration-300 hover:bg-[#007AFF]/20 disabled:opacity-50"
                  >
                    <RefreshCcw className={`mr-1 inline h-3 w-3 ${isReverting ? "animate-spin" : ""}`} />
                    Google rasmiga qaytish
                  </button>
                </div>
              )}
            </div>

            {/* Status badges - o'ng tepa burchak */}
            <div className="absolute right-6 top-6 flex flex-col items-end gap-1.5">
              {isAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                  <UserIcon className="h-3 w-3" />
                  Admin
                </span>
              )}
              {isPremium && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              )}
              {!isPremium && !isAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  <UserIcon className="h-3 w-3" />
                  User
                </span>
              )}
            </div>
          </div>

          <dl className="mt-7 grid gap-px overflow-hidden rounded-[20px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tangalar", value: user.coins ?? 0 },
              { label: "Kunlik", value: `${user.streak ?? 0} kun` },
              { label: "Qurilmalar", value: `${devices.length} / ${isPremium ? 5 : 2}` },
              { label: "Reja", value: isPremium ? "Premium" : "Bepul" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card px-5 py-4">
                <dt className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="headline mt-1 text-[24px]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ======================================= */}
        {/* 2. TEST HISTORY                         */}
        {/* ======================================= */}
        <section className="overflow-hidden rounded-[28px] border border-border bg-card">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-6">
            <div>
              <h2 className="headline text-[20px]">{t("history")}</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Test natijalaringiz
              </p>
            </div>
            <button
              onClick={fetchResults}
              disabled={isFetchingResults}
              className="text-[13px] text-muted-foreground transition-colors duration-300 hover:text-[#007AFF] disabled:opacity-50"
            >
              <RefreshCcw className={`inline h-4 w-4 ${isFetchingResults ? "animate-spin" : ""}`} />
            </button>
          </div>

          {results.length === 0 && !isFetchingResults ? (
            <p className="p-10 text-center text-[14px] text-muted-foreground">
              {t("noHistory")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Sana</th>
                    <th className="px-6 py-4 font-medium">Test</th>
                    <th className="px-6 py-4 font-medium">Level</th>
                    <th className="px-6 py-4 font-medium">Natija</th>
                    <th className="px-6 py-4 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.id}
                      className="cursor-pointer border-t border-border transition-colors duration-300 hover:bg-secondary"
                      onClick={() =>
                        (window.location.href = `/dashboard/jlpt/${result.test_id}/result/${result.id}`)
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-[14px] text-muted-foreground">
                        {new Date(result.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium">
                        {result.test_title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[12px] font-medium">
                          {result.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="h-[6px] w-20 overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${result.score}%`,
                                backgroundColor: result.passed ? "#007AFF" : "#ef4444",
                              }}
                            />
                          </span>
                          <span className="text-[14px] tabular-nums">{result.score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
                          style={{
                            color: result.passed ? "#007AFF" : "#ef4444",
                            backgroundColor: result.passed 
                              ? "rgba(0, 122, 255, 0.12)" 
                              : "rgba(239, 68, 68, 0.12)",
                          }}
                        >
                          {result.passed ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {result.passed ? "O'tdi" : "Yiqildi"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ======================================= */}
        {/* 3. DEVICES                              */}
        {/* ======================================= */}
        <section className="overflow-hidden rounded-[28px] border border-border bg-card">
          <div className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="headline text-[20px]">{t("devicesTitle")}</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {t("devices")}
                </p>
              </div>
              <button
                onClick={fetchDevices}
                disabled={isDevicesLoading}
                className="text-muted-foreground transition-colors duration-300 hover:text-[#007AFF] disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${isDevicesLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <ul>
            {devices.map((device) => {
              const Icon = getDeviceIcon(device.name || "")
              return (
                <li
                  key={device.id}
                  className={`flex flex-wrap items-center gap-4 border-b border-border px-6 py-5 last:border-b-0 transition-colors duration-300 ${
                    device.is_current ? "bg-[#007AFF]/5" : "hover:bg-secondary"
                  }`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${
                    device.is_current ? "bg-[#007AFF]/10 text-[#007AFF]" : "bg-secondary text-muted-foreground"
                  }`}>
                    {Icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium">
                      {formatDeviceName(device.name)}
                      {device.is_current && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#007AFF]">
                          <Check className="h-3 w-3" />
                          Hozir
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {device.is_current 
                        ? "Joriy sessiya" 
                        : `Oxirgi: ${timeAgo(device.last_used_at)}`}
                    </p>
                  </div>

                  {!device.is_current && (
                    <button
                      onClick={() => handleLogoutDevice(device.id)}
                      className="rounded-full border border-border px-4 py-2 text-[13px] text-destructive transition-colors duration-300 hover:bg-destructive/10"
                    >
                      Chiqarish
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          {devices.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-5">
              <p className="text-[13px] text-muted-foreground">
                Boshqa barcha qurilmalardan chiqish
              </p>
              <button
                onClick={handleLogoutOthers}
                className="rounded-full border border-border px-5 py-2 text-[13px] text-destructive transition-colors duration-300 hover:bg-destructive/10"
              >
                Hammasini chiqarish
              </button>
            </div>
          )}
        </section>

        {/* ======================================= */}
        {/* 4. LOGOUT BUTTON                        */}
        {/* ======================================= */}
        <div className="flex justify-center">
          <button
            onClick={handleMainLogout}
            className="flex items-center gap-2 rounded-full border border-destructive/20 px-6 py-3 text-[14px] font-medium text-destructive transition-colors duration-300 hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      </div>
    </>
  )
}