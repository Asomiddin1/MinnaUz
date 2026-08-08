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
          className={`flex h-16 items-center gap-2.5 px-4 ${collapsed ? "justify-center" : "justify-between"}`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={'/logo.png'}
              alt="Logo"
              width={40}
              height={40}
              className="h-[40px] w-[40px] shrink-0"
            />
            {!collapsed && <span className="headline text-[18px] tracking-[-0.045em]">MinnaUz</span>}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="hidden h-8 w-8 place-items-center rounded-[10px] text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-foreground lg:grid"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        {/* COLLAPSED TOGGLE */}
        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mb-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <PanelLeft size={20} />
          </button>
        )}

        {/* MENU */}
        <nav className="px-3 pt-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isItemActive(item.href)

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] transition-all duration-300 ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-primary font-medium text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-[19px] w-[19px] shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* MAQSADINGIZGA YAQINLASHYAPSIZ KARTACHKASI */}
        {courseProgress && !collapsed && (
          <div className="mx-3 mt-6 rounded-[20px] border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-snug">Maqsadingizga yaqinlashyapsiz!</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Daraja: <span className="text-primary">{courseProgress.level?.title || "Daraja"}</span>
                </p>
              </div>
              <GoalRing value={courseProgress.progress_percentage || 0} />
            </div>
            <Link
              href={`/dashboard/level/${courseProgress.level?.slug}/watch`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity duration-300 hover:opacity-90 active:scale-[0.98]"
            >
              Davom etish
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        )}

        {/* PASTKI BLOKLAR (ADMIN PANEL, PROFIL, CHIQISH) */}
        <div className="mt-auto space-y-1 border-t border-border p-3">
          
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              title={collapsed ? (t("adminPanel") || "Panel administratori") : undefined}
              className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-[13px] text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-foreground ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <ShieldAlert className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{t("adminPanel") || "Panel administratori"}</span>}
            </Link>
          )}

          {/* PROFIL QISMI - YAXSHILANDI */}
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            {status === "loading" ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : (
              // UI Avatar komponentidan foydalanildi
              <Avatar className="h-9 w-9 shrink-0 border border-border">
                {session?.user?.image && (
                  <AvatarImage 
                    src={getAvatarUrl(session.user.image)} 
                    alt={userName} 
                    className="object-cover"
                  />
                )}
                {/* Rasm bo'lmasa yoki yuklanayotgan bo'lsa fallback ko'rinadi */}
                <AvatarFallback className="bg-secondary text-secondary-foreground text-[13px] font-semibold">
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
                    <p className="truncate text-[13px] font-medium">{userName}</p>
                    {userEmail && (
                      <p className="truncate text-[12px] text-muted-foreground">{userEmail}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            title={collapsed ? "Chiqish" : undefined}
            className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-[13px] text-destructive transition-colors duration-300 hover:bg-secondary ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Chiqish</span>}
          </button>

        </div>

      </SidebarContent>
    </Sidebar>
  )
}