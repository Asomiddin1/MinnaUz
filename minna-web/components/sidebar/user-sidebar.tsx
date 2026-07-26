"use client"

import { Link, usePathname } from "@/src/i18n/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

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
import logoImg from "./logo.png"
import { useTranslations } from "next-intl"

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
    // { name: t("achievements") || "Yutuqlar", href: "/dashboard", icon: Award },
  ]

  const userName = session?.user?.name || "Guest User"
  const userEmail = session?.user?.email || ""

  const getAvatarUrl = (url?: string | null) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    const rootUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "")
    return `${rootUrl}${url}`
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 !bg-white dark:!border-[#1F2937] dark:!bg-[#0B0F19]"
    >
      <SidebarContent className="flex h-full flex-col overflow-hidden">
        
        {/* LOGO */}
        <div
          className={`mb-2 flex items-center p-6 ${collapsed ? "justify-center px-2" : "justify-between"}`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Image
                src={logoImg}
                alt="Logo"
                width={32}
                height={32}
              />
              <span className="text-sm font-bold tracking-widest text-slate-900 dark:text-slate-100">
                MinnaUz
              </span>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Image
                src={logoImg}
                alt="Logo"
                width={32}
                height={32}
              />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 ${collapsed ? "hidden" : "block"}`}
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        {/* COLLAPSED TOGGLE */}
        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mb-4 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <PanelLeft size={20} />
          </button>
        )}

        {/* MENU */}
        <SidebarMenu
          className={`space-y-1.5 px-4 ${collapsed ? "items-center px-2" : ""}`}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.name}>
                <Link
                  href={item.href}
                  className={`flex h-11 items-center rounded-2xl transition-all ${collapsed ? "w-11 justify-center" : "w-full gap-3 px-4"} ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 font-bold"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-600 dark:text-slate-300 dark:hover:bg-violet-950/30 dark:hover:text-violet-400 font-semibold"
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-white" : ""}`} />
                  {!collapsed && <span className={`text-xs ${isActive ? "text-white" : ""}`}>{item.name}</span>}
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {/* MAQSADINGIZGA YAQINLASHYAPSIZ KARTACHKASI */}
        {!collapsed && (
          <div className="mx-4 my-3 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm relative">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Maqsadingizga yaqinlashyapsiz!
                </h4>
                <p className="text-[11px] text-slate-400">
                  Daraja: <span className="font-extrabold text-violet-600 dark:text-violet-400">N5</span>
                </p>
              </div>
              
              {/* Doiraviy Progress (68%) */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="h-12 w-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-800 fill-none" />
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset="36" className="text-violet-600 fill-none" />
                </svg>
                <span className="absolute text-[10px] font-extrabold text-slate-900 dark:text-white">68%</span>
              </div>
            </div>

            <Link 
              href="/dashboard/jlpt" 
              className="w-full mt-3 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Davom etish</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* PASTKI BLOKLAR (ADMIN PANEL, PROFIL, CHIQISH) */}
        <div className="mt-auto flex flex-col gap-2 p-4 border-t border-slate-200/80 dark:border-[#1F2937]">
          
          {(session?.user?.role === "admin" || true) && (
            <Link 
              href="/admin" 
              className={`flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors ${collapsed ? "justify-center" : ""}`}
            >
              <ShieldAlert className="h-5 w-5 text-slate-600 dark:text-slate-300 shrink-0" />
              {!collapsed && (
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Panel administratori
                </span>
              )}
            </Link>
          )}

          <div className={`flex items-center gap-3 py-1 ${collapsed ? "justify-center" : ""}`}>
            {status === "loading" ? (
              <Skeleton className="h-9 w-9 rounded-full dark:bg-[#1E293B]" />
            ) : session?.user?.image ? (
              <img
                src={getAvatarUrl(session.user.image)}
                alt="avatar"
                className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 font-bold text-white shadow-sm">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                {status === "loading" ? (
                  <>
                    <Skeleton className="h-4 w-24 dark:bg-[#1E293B]" />
                    <Skeleton className="h-3 w-32 dark:bg-[#1E293B]" />
                  </>
                ) : (
                  <>
                    <span className="line-clamp-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                      {userName}
                    </span>
                    {userEmail && (
                      <span className="line-clamp-1 text-[10px] text-slate-400 dark:text-slate-500">
                        {userEmail}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className={`flex h-10 w-full items-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ${collapsed ? "justify-center" : "gap-3 px-3"}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-xs font-semibold">Chiqish</span>}
          </button>

        </div>

      </SidebarContent>
    </Sidebar>
  )
}