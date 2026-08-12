"use client"

import { Link, usePathname } from "@/src/i18n/navigation"
import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
// Avatar komponentlari import qilindi
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  Home,
  GraduationCap,
  MonitorPlay,
  Gem,
  User,
  Award,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ShieldAlert,
  ArrowRight,
} from "lucide-react"

import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { userAPI, getAvatarUrl } from "@/lib/api/user"

interface CourseProgress {
  level?: { title: string; slug: string }
  progress_percentage?: number
}

function GoalRing({ value }: { value: number }) {
  const r = 20
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden>
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--muted)" strokeWidth="3" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
        transform="rotate(-90 24 24)"
      />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
        transform="rotate(-90 24 24)"
      />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="600"
        fill="var(--foreground)"
      >
        {value}%
      </text>
    </svg>
  )
}

export function UserSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  const { data: session, status } = useSession()
  const t = useTranslations("Sidebar")

  const menuItems = [
    { name: t("home"), href: "/dashboard", icon: Home },
    { name: t("videos"), href: "/dashboard/video", icon: MonitorPlay },
    { name: t("jlpt"), href: "/dashboard/jlpt", icon: GraduationCap },
    { name: t("premium"), href: "/dashboard/premium", icon: Gem },
    { name: t("profile"), href: "/dashboard/profile", icon: User },
  ]

  const userName = session?.user?.name || "Guest User"
  const userEmail = session?.user?.email || ""

  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      userAPI.getCourseProgress()
        .then(res => {
          if (res.data?.data) {
            setCourseProgress(res.data.data)
          }
        })
        .catch(err => console.error("Failed to load course progress", err))
    }
  }, [status])

  // Derive initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean) // Bo'sh joylarni olib tashlash
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to check if a nav item is active
  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      // Home: only active when exactly /dashboard
      return pathname === "/dashboard"
    }
    // Other routes: active when pathname matches exactly or starts with href/
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border !bg-card"
    >
      <SidebarContent className="flex h-full flex-col">
        
        {/* LOGO */}
        <div
          className={`flex h-20 items-center gap-3 px-5 ${collapsed ? "justify-center" : "justify-between"}`}
        >
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={'/logo.png'}
              alt="Logo"
              width={44}
              height={44}
              className="h-[44px] w-[44px] shrink-0 drop-shadow-sm"
            />
            {!collapsed && <span className="headline text-[22px] font-bold tracking-tight">MinnaUz</span>}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="hidden h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-foreground lg:grid"
            >
              <PanelLeftClose className="h-[20px] w-[20px]" />
            </button>
          )}
        </div>

        {/* COLLAPSED TOGGLE */}
        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mb-6 mt-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <PanelLeft size={22} />
          </button>
        )}

        {/* MENU */}
        <nav className="px-4 pt-4">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = isItemActive(item.href)

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[15px] transition-all duration-300 font-medium ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon className={`shrink-0 ${collapsed ? 'h-[22px] w-[22px]' : 'h-[20px] w-[20px]'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* MAQSADINGIZGA YAQINLASHYAPSIZ KARTACHKASI */}
        {courseProgress && !collapsed && (
          <div className="mx-4 mt-6 rounded-[24px] border border-border p-5 bg-card/50 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug">Maqsadingizga yaqinlashyapsiz!</p>
                <p className="mt-1.5 text-[13px] text-muted-foreground font-medium">
                  Daraja: <span className="text-primary font-bold">{courseProgress.level?.title || "Daraja"}</span>
                </p>
              </div>
              <GoalRing value={courseProgress.progress_percentage || 0} />
            </div>
            <Link
              href={`/dashboard/level/${courseProgress.level?.slug}/watch`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[14px] font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]"
            >
              Davom etish
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}

        {/* PASTKI BLOKLAR (ADMIN PANEL, PROFIL, CHIQISH) */}
        <div className="mt-auto space-y-1.5 border-t border-border p-4">
          
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              title={collapsed ? (t("adminPanel") || "Panel administratori") : undefined}
              className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[14px] font-medium text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-foreground ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <ShieldAlert className="h-[20px] w-[20px] shrink-0" />
              {!collapsed && <span>{t("adminPanel") || "Panel administratori"}</span>}
            </Link>
          )}

          {/* PROFIL QISMI - YAXSHILANDI */}
          <div className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-colors hover:bg-secondary/50 ${collapsed ? 'justify-center' : ''}`}>
            {status === "loading" ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
              // UI Avatar komponentidan foydalanildi
              <Avatar className="h-10 w-10 shrink-0 border border-border shadow-sm">
                {session?.user?.image && (
                  <AvatarImage 
                    src={getAvatarUrl(session.user.image)} 
                    alt={userName} 
                    className="object-cover"
                  />
                )}
                {/* Rasm bo'lmasa yoki yuklanayotgan bo'lsa fallback ko'rinadi */}
                <AvatarFallback className="bg-primary/10 text-primary text-[14px] font-bold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            )}

            {!collapsed && (
              <div className="min-w-0">
                {status === "loading" ? (
                  <>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </>
                ) : (
                  <>
                    <p className="truncate text-[14px] font-semibold text-foreground">{userName}</p>
                    {userEmail && (
                      <p className="truncate text-[13px] text-muted-foreground font-medium">{userEmail}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            title={collapsed ? "Chiqish" : undefined}
            className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[14px] font-medium text-destructive transition-colors duration-300 hover:bg-destructive/10 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-[20px] w-[20px] shrink-0" />
            {!collapsed && <span>Chiqish</span>}
          </button>

        </div>

      </SidebarContent>
    </Sidebar>
  )
}