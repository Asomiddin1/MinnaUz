"use client"

import { useState, useEffect } from "react"
import {
  Copy,
  Gamepad2,
  BookOpen,
  GraduationCap,
  ShoppingCart,
  Languages,
  Sparkles,
  Gem,
  Layers,
  Maximize,
} from "lucide-react"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { getAvatarUrl } from "@/lib/api/user"

// Komponentlarni import qilish
import dynamic from "next/dynamic"
import BannerCarousel from "@/components/user-components/banner/banner-carousel"
import JlptLevels from "@/components/user-components/home-fuctions/jlpt-levels/jlpt-levels"
import { StreakCalendar } from "@/components/user-components/streak-calendar"
import { QuickCategories } from "@/components/user-components/home-fuctions/quick-categories"
import { UmumiyProgress } from "@/components/user-components/umumiy-progress"
import React from "react"

// Lazy-loaded tab components
const GamesList = dynamic(
  () => import("@/components/user-components/home-fuctions/games/games"),
  { ssr: false }
)
const Lugat = dynamic(
  () => import("@/components/user-components/home-fuctions/lugat/lugat"),
  { ssr: false }
)
const Dokkai = dynamic(
  () => import("@/components/user-components/home-fuctions/dokkai/dokkai"),
  { ssr: false }
)
const Shop = dynamic(
  () => import("@/components/user-components/home-fuctions/shop/shop"),
  { ssr: false }
)
const Translate = dynamic(
  () =>
    import("@/components/user-components/home-fuctions/translate/translate"),
  { ssr: false }
)
const AiComponent = dynamic(
  () => import("@/components/user-components/home-fuctions/ai/ai"),
  { ssr: false }
)
const Kanji = dynamic(
  () => import("@/components/user-components/home-fuctions/kanji/kanji"),
  { ssr: false }
)
const Premium = dynamic(
  () => import("@/components/user-components/home-fuctions/premium/premium"),
  { ssr: false }
)

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const t = useTranslations("Dashboard")

  const TABS = [
    t("main_page"),
    t("dictionary"),
    t("games"),
    t("dokkai"),
    t("kanji"),
    t("shop"),
    t("translator"),
    t("ai"),
    t("premium"),
  ]

  const MENU_ITEMS = [
    { id: "dictionary", label: t("dictionary"), icon: Copy, color: "" },
    { id: "games", label: t("games"), icon: Gamepad2, color: "" },
    { id: "dokkai", label: t("dokkai"), icon: BookOpen, color: "" },
    { id: "kanji", label: t("kanji"), icon: GraduationCap, color: "" },
    { id: "shop", label: t("shop"), icon: ShoppingCart, color: "" },
    { id: "translator", label: t("translator"), icon: Languages, color: "" },
    { id: "ai", label: t("ai"), icon: Sparkles, color: "" },
    { id: "premium", label: t("premium"), icon: Gem, color: "text-amber-500 dark:text-amber-400" },
  ]

  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    )
  }

  const handleExpandPage = () => {
    if (activeTab === 0) {
      router.push("/dashboard")
    } else {
      const item = MENU_ITEMS[activeTab - 1]
      router.push(`/dashboard/${item.id}`)
    }
  }

  return (
    <div className="w-full">
      {/* MOBIL KO'RINISh */}
      <div className="flex w-full flex-col md:hidden">
        {/* Mobil uchun o'zining ichki headeri top-0 da qolaveradi, chunki bu yerda layout headeri yo'q */}
        <div className="sticky top-0 z-40 w-full border-b border-border bg-glass px-3 py-3 backdrop-blur-2xl">
          <header className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Link href={"/dashboard/profile"} className="flex items-center gap-3">
                <div className="h-[46px] w-[46px] shrink-0 overflow-hidden rounded-full border-2 border-border bg-secondary">
                  {session?.user?.image && (
                    <img
                      src={getAvatarUrl(session.user.image)}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    こんにちは
                  </span>
                  <span className="text-[15px] font-semibold leading-tight text-foreground">
                    {session?.user?.name || "Foydalanuvchi"}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 backdrop-blur-sm">
                <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#FFB800] text-[10px] text-white shadow-inner">
                  🪙
                </div>
                <span className="text-[13px] font-semibold text-foreground">
                  1000
                </span>
              </div>
            </div>
          </header>
        </div>

        <div className="w-full max-w-[100vw] space-y-4 overflow-hidden px-2 pt-4 pb-10">
          <div className="w-full px-1">
            <div className="w-full overflow-hidden rounded-2xl">
              <BannerCarousel />
            </div>
          </div>

          <div className="relative w-full p-4">
            <div className="absolute top-0 right-0 -z-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

            <div className="grid grid-cols-4 gap-x-3 gap-y-6">
              {MENU_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(index + 1)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-border bg-card transition-all duration-300 hover:bg-secondary active:scale-95">
                    <item.icon
                      className={`h-8 w-8 ${item.color ? item.color : "text-foreground"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="px-2">
              <h1 className="text-[20px] font-semibold text-foreground">
                {t("jlptLevels")}
              </h1>
            </div>
            <JlptLevels />
          </div>
        </div>
      </div>

      {/* DESKTOP KO'RINISh */}
      <div className="relative hidden w-full md:block">
        
        {/* SHU YER O'ZGARDI: top-[61px] qilindi. Asosiy Header 61px atrofida joy egallaganligi uchun unga tegib turadi */}
        <div className="sticky top-[61px] z-30 w-full border-b border-border bg-[#F8FAFC]/90 px-4 py-2 backdrop-blur-xl sm:px-6 dark:bg-slate-950/90">
          <div className="flex items-center justify-between">
            <nav className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {TABS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  aria-current={i === activeTab ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-[13px] transition-all duration-300 ${
                    i === activeTab
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {i === 0 && <Layers className="h-4 w-4" />}
                  {i > 0 && MENU_ITEMS[i - 1] && (
                    <span className="flex items-center gap-2">
                      {React.createElement(MENU_ITEMS[i - 1].icon, { 
                        className: `h-4 w-4 ${MENU_ITEMS[i - 1].color || ''}` 
                      })}
                      {label}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <button
              onClick={handleExpandPage}
              className="ml-4 flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-all duration-300 hover:bg-secondary hover:text-foreground"
              title="Sahifani to'liq ekranda ochish"
            >
              <Maximize className="h-4 w-4" />
              <span className="hidden sm:inline">{t("expansion")}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 py-7 sm:px-6">
          {activeTab === 0 && (
            <div className="flex w-full flex-col space-y-4">
              <div className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-12">
                <div className="flex w-full flex-col gap-4 lg:col-span-8">
                  <BannerCarousel />
                  <QuickCategories />
                  <JlptLevels />
                </div>
                {/* O'ng tarafdagi kalendar ham scroll qilinganda qotib turishi uchun top-32 ga tushirildi */}
                <div className="sticky top-[130px] flex w-full self-start flex-col gap-3 lg:col-span-4">
                  <div className="w-full">
                    <StreakCalendar />
                  </div>
                  <UmumiyProgress />
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && <Lugat />}
          {activeTab === 2 && <GamesList />}
          {activeTab === 3 && <Dokkai />}
          {activeTab === 4 && <Kanji />}
          {activeTab === 5 && <Shop />}
          {activeTab === 6 && <Translate />}
          {activeTab === 7 && <AiComponent />}
          {activeTab === 8 && <Premium />}
        </div>
      </div>
    </div>
  )
}