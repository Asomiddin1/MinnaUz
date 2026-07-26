"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/sidebar/user-sidebar"
import { Link, usePathname } from "@/src/i18n/navigation"
import {
  Home,
  PlaySquare,
  GraduationCap,
  Gem,
  Sun,
  Moon,
  Monitor,
  Search,
  Check,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import LanguageSwitcher from "@/components/minna-uz/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const t = useTranslations("Dashboard")

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isHome = pathname === "/dashboard"
  const isVideo = pathname === "/dashboard/video" || pathname.startsWith("/dashboard/video/")
  const isJlpt = pathname === "/dashboard/jlpt" || pathname.startsWith("/dashboard/jlpt/")
  const isPremium = pathname === "/dashboard/premium" || pathname.startsWith("/dashboard/premium/")

  const themeOptions = [
    { value: "light", label: t("light"), icon: Sun },
    { value: "dark", label: t("dark"), icon: Moon },
    { value: "system", label: t("system"), icon: Monitor },
  ]

  return (
    <SidebarProvider>
      <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[#F8FAFC] transition-colors duration-300 dark:bg-slate-950">
        <div className="z-20 hidden h-full md:block">
          <UserSidebar />
        </div>

        <main className="relative z-10 flex h-full w-full flex-1 flex-col overflow-y-auto pb-[110px] md:pb-0">
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur-md md:flex dark:border-slate-800 dark:bg-slate-900/80">
            <div className="group relative w-full max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-blue-400" />
              <input
                type="text"
                placeholder={t("search")}
                className="w-full rounded-full border border-slate-200 bg-[#F8FAFC] py-2 pr-4 pl-10 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <div className="mx-1 h-5 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                    aria-label="Toggle theme"
                  >
                    {mounted &&
                      (theme === "dark" ? (
                        <Sun className="h-4 w-4 text-slate-200" />
                      ) : (
                        <Moon className="h-4 w-4 text-slate-500" />
                      ))}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setTheme(value)}
                      className="flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      {mounted && theme === value && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </main>

        
        {/* 🪄 SIRG'ALIB O'TUVCHI PRO TAB BAR */}
       <div className="fixed bottom-4 left-9 right-6 z-50 flex justify-center md:hidden">
         <nav className="relative flex h-[70px] w-full max-w-md items-center justify-between rounded-[45px] border border-white/60 bg-white/30 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            {/* Home */}
            <Link
              href="/dashboard"
              className={`group relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[24px] transition-all duration-300 ease-out active:scale-90 ${
                isHome 
                  ? "bg-violet-100 text-violet-700 shadow-md shadow-violet-500/25 dark:bg-violet-300/10 dark:text-violet-100" 
                  : "bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className={`relative flex items-center justify-center transition-transform duration-300 ${isHome ? "-translate-y-0.5 scale-110" : "group-hover:scale-105"}`}>
                <Home className="h-6 w-6 drop-shadow-sm" strokeWidth={isHome ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] leading-none tracking-wide ${isHome ? "font-bold" : "font-medium"}`}>
                {t("home")}
              </span>
            </Link>

            {/* Video */}
            <Link
              href="/dashboard/video"
              className={`group relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[24px] transition-all duration-300 ease-out active:scale-90 ${
                isVideo 
                  ? "bg-violet-100 text-violet-700 shadow-md shadow-violet-500/25 dark:bg-violet-500/30 dark:text-violet-300" 
                  : "bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className={`relative flex items-center justify-center transition-transform duration-300 ${isVideo ? "-translate-y-0.5 scale-110" : "group-hover:scale-105"}`}>
                <PlaySquare className="h-6 w-6 drop-shadow-sm" strokeWidth={isVideo ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] leading-none tracking-wide ${isVideo ? "font-bold" : "font-medium"}`}>
                {t("video")}
              </span>
            </Link>

            {/* JLPT */}
            <Link
              href="/dashboard/jlpt"
              className={`group relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[24px] transition-all duration-300 ease-out active:scale-90 ${
                isJlpt 
                  ? "bg-violet-100 text-violet-700 shadow-md shadow-violet-500/25 dark:bg-violet-500/30 dark:text-violet-300" 
                  : "bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className={`relative flex items-center justify-center transition-transform duration-300 ${isJlpt ? "-translate-y-0.5 scale-110" : "group-hover:scale-105"}`}>
                <GraduationCap className="h-6 w-6 drop-shadow-sm" strokeWidth={isJlpt ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] leading-none tracking-wide ${isJlpt ? "font-bold" : "font-medium"}`}>
                {t("jlpt")}
              </span>
            </Link>

            {/* Premium */}
            <Link
              href="/dashboard/premium"
              className={`group relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-[24px] transition-all duration-300 ease-out active:scale-90 ${
                isPremium 
                  ? "bg-violet-100 text-violet-700 shadow-md shadow-violet-500/25 dark:bg-violet-500/30 dark:text-violet-300" 
                  : "bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <div className={`relative flex items-center justify-center transition-transform duration-300 ${isPremium ? "-translate-y-0.5 scale-110" : "group-hover:scale-105"}`}>
                <Gem className="h-6 w-6 drop-shadow-sm" strokeWidth={isPremium ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] leading-none tracking-wide ${isPremium ? "font-bold" : "font-medium"}`}>
                {t("premium")}
              </span>
            </Link>

          </nav>
        </div>
      </div>
    </SidebarProvider>
  )
}