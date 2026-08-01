"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Users,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  GraduationCap,
  Layers,
  BookOpen,
  PlayCircle,
  BookMarked,
  PenTool,
  Languages,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { getAvatarUrl } from "@/lib/api/user"

export function AdminSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const { data: session, status } = useSession()
  const t = useTranslations("AdminSidebar")

  const menuItems = [
    { name: t("dashboard"), href: "/admin", icon: Home },
    { name: t("videos"), href: "/admin/videos", icon: PlayCircle },
    { name: t("levels"), href: "/admin/levels", icon: Layers },
    { name: t("createDokkai"), href: "/admin/dokkai", icon: Languages },
    { name: t("grammar"), href: "/admin/grammars", icon: Languages },
    { name: t("kanjis"), href: "/admin/kanjis", icon: PenTool },
    { name: t("vocabularies"), href: "/admin/vocabularies", icon: BookMarked },
    { name: t("jlptTests"), href: "/admin/tests", icon: GraduationCap },
    { name: t("users"), href: "/admin/users", icon: Users },
  ]
  const userName = session?.user?.name || "Guest User"
  const userEmail = session?.user?.email || ""

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex h-full flex-col overflow-hidden">
        {/* LOGO */}
        <div
          className={`mb-2 flex items-center p-6 ${
            collapsed ? "justify-center px-2" : "justify-between"
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background font-semibold">
                M
              </div>
              <span className="text-sm font-medium tracking-wide">
                MinnaUz Admin
              </span>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background font-semibold">
              M
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`text-muted-foreground transition-colors hover:text-foreground ${
              collapsed ? "hidden" : "block"
            }`}
          >
            <PanelLeftClose size={20} />
          </button>
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
        <SidebarMenu
          className={`flex-1 space-y-1 px-3 ${
            collapsed ? "items-center px-2" : ""
          }`}
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
                    className={`flex h-10 items-center rounded-md transition-colors ${
                      collapsed ? "w-10 justify-center" : "w-full gap-3 px-3"
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
        {session?.user?.role === "admin" && (
          <Link href={"/dashboard"} className="flex justify-center px-4 py-2">
            <button className="w-full cursor-pointer rounded-2xl bg-[#4b4b4b] py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700">
              {collapsed ? "D" : t("backToDashboard")}
            </button>
          </Link>
        )}
        {/* USER INFO */}
        <div className="mt-auto border-t p-3">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            {status === "loading" ? (
              <>
                <Skeleton className="h-9 w-9 rounded-full" />
                {!collapsed && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                )}
              </>
            ) : (
              <>
                {session?.user?.image ? (
                  <img
                    src={getAvatarUrl(session.user.image)}
                    alt="avatar"
                    className="h-9 w-9 rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userName}</span>
                    {userEmail && (
                      <span className="text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <div className="border-t px-3 pt-2 pb-3">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className={`flex h-10 w-full items-center rounded-md text-destructive transition-colors hover:bg-destructive/10 ${
              collapsed ? "justify-center" : "gap-3 px-3"
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="font-medium">{t("logout")}</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
