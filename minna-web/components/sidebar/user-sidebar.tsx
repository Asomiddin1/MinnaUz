"use client"

import { Link, usePathname } from "@/src/i18n/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

import {
  Home,
  GraduationCap,
  MonitorPlay,
  Gem,
  User,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react"

import { useTheme } from "next-themes"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import logoImg from "./logo.png"
import { useTranslations } from "next-intl"
import { getAvatarUrl } from "@/lib/api/user"

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


  return (
    <Sidebar
      collapsible="icon"
      // DIQQAT: Sidebar rangi Layout bilan 100% bir xil qilindi: dark:!bg-[#0B0F19]
      // Shadcn CSS ni majburan bosib ketish uchun !bg ishlatilgan
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
          className={`flex-1 space-y-2 px-4 ${collapsed ? "items-center px-2" : ""}`}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link
                    href={item.href}
                    className={`flex h-11 items-center rounded-xl transition-all ${collapsed ? "w-11 justify-center" : "w-full gap-3 px-4"} ${
                      isActive
                        ? // Aktiv bo'lganda ajralib turishi uchun sal yorqinroq fon berdik (dark:bg-[#1E293B])
                          "border border-slate-200 bg-slate-100 text-slate-900 shadow-sm dark:border-transparent dark:bg-[#1E293B] dark:text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-[#1E293B]/50 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {/* ADMIN PANEL BUTTON */}
        {session?.user?.role === "admin" && (
          <Link href={"/admin"} className="flex justify-center px-4 py-2">
            <button className="w-full cursor-pointer rounded-2xl border border-transparent bg-slate-800 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-700 dark:bg-[#1E293B] dark:hover:bg-[#334155]">
              {collapsed ? "A" : t("adminPanel")}
            </button>
          </Link>
        )}

        {/* USER INFO */}
        <div className="mt-auto border-t border-slate-200/80 p-4 dark:border-[#1F2937]">
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            {status === "loading" ? (
              <Skeleton className="h-9 w-9 rounded-full dark:bg-[#1E293B]" />
            ) : session?.user?.image ? (
              <img
                src={getAvatarUrl(session.user.image)}
                alt="avatar"
                className="h-9 w-9 rounded-full border border-slate-200 object-cover dark:border-transparent"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 font-bold text-white shadow-sm">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {!collapsed && (
              <div className="flex flex-col space-y-1.5">
                {status === "loading" ? (
                  <>
                    <Skeleton className="h-4 w-24 dark:bg-[#1E293B]" />
                    <Skeleton className="h-3 w-32 dark:bg-[#1E293B]" />
                  </>
                ) : (
                  <>
                    <span className="line-clamp-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {userName}
                    </span>
                    {userEmail && (
                      <span className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {userEmail}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="border-t border-slate-200/80 px-2 pb-3 dark:border-[#1F2937]">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className={`flex h-10 w-full items-center rounded-xl text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 ${collapsed ? "justify-center" : "gap-3 px-4"}`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="font-medium">{t("logout")}</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
