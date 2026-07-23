"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// Komponentlarni import qilish
import dynamic from "next/dynamic"
import BannerCarousel from "@/components/user-components/banner/banner-carousel"
import JlptLevels from "@/components/user-components/home-fuctions/jlpt-levels/jlpt-levels"

// Lazy-loaded tab components — загружаются только при клике на вкладку
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
  const { data: session, status } = useSession()
  const t = useTranslations("Dashboard")

  const MENU_ITEMS = [
    {
      id: "dictionary",
      label: t("dictionary"),
      icon: Copy,
      href: "/dashboard/dictionary",
      isTab: true,
    },
    {
      id: "games",
      label: t("games"),
      icon: Gamepad2,
      href: "/dashboard/games",
      isTab: true,
    },
    {
      id: "dokkai",
      label: t("dokkai"),
      icon: BookOpen,
      href: "/dashboard/dokkai",
      isTab: true,
    },
    {
      id: "kanji",
      label: t("kanji"),
      icon: GraduationCap,
      href: "/dashboard/kanji",
      isTab: true,
    },
    {
      id: "shop",
      label: t("shop"),
      icon: ShoppingCart,
      href: "/dashboard/shop",
      isTab: true,
    },
    {
      id: "translator",
      label: t("translator"),
      icon: Languages,
      href: "/dashboard/translator",
      isTab: true,
    },
    {
      id: "ai",
      label: t("ai"),
      icon: Sparkles,
      href: "/dashboard/ai",
      isTab: true,
    },
    {
      id: "premium",
      label: t("premium"),
      icon: Gem,
      href: "/dashboard/premium",
      color: "text-amber-500 dark:text-amber-400",
      isTab: true,
    },
  ]

  // State'lar
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("jlpt")
  const [showNav, setShowNav] = useState(true)

  // Hydration error oldini olish
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 🚀 YAKUNIY YECHIM: Eng chaqqon va sezgir scroll mantiqi
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // 1. Ekranning eng tepasida turganda (yoki tortilganda) doim ko'rsatish
          if (currentScrollY <= 10) {
            setShowNav(true)
          }
          // 2. Pastga aylantirganda (Yashirish)
          else if (currentScrollY > lastScrollY) {
            setShowNav(false)
          }
          // 3. Tepaga salgina o'tsa ham (Darhol tushib kelish)
          else if (currentScrollY < lastScrollY) {
            setShowNav(true)
          }

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="text-slate-500">Yuklanmoqda...</div>
      </div>
    )
  }

  const handleTabClick = (item: any) => {
    if (item.isTab) {
      setActiveTab(item.id)
    } else {
      router.push(item.href)
    }
  }

  const handleExpandPage = () => {
    if (activeTab === "jlpt") {
      router.push("/dashboard")
    } else {
      const currentTab = MENU_ITEMS.find((item) => item.id === activeTab)
      if (currentTab && currentTab.href) {
        router.push(currentTab.href)
      }
    }
  }

  return (
    <div className="w-full">
      {/* =======================
          📱 MOBIL KO'RINISh
      ======================== */}
      <div className="flex w-full flex-col md:hidden">
        {/* MOBIL UCHUN SEZGIR NAVBAR */}
        <div
          className={`sticky top-0 z-50 w-full border-b border-slate-100/50 bg-white/95 pt-3 pb-3 shadow-sm backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-slate-800/50 dark:bg-slate-950/95 ${
            showNav ? "translate-y-0" : "-translate-y-[110%]"
          }`}
        >
          <header className="flex flex-col gap-3 px-3">
            <div className="flex items-center justify-between">
              <Link
                href={"/dashboard/profile"}
                className="flex items-center gap-3"
              >
                <div className="h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-blue-100 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                  {session?.user?.image && (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    こんにちは
                  </span>
                  <span className="text-[15px] leading-tight font-bold text-slate-900 dark:text-white">
                    {session?.user?.name || "Foydalanuvchi"}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 rounded-full border border-slate-100/60 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-colors dark:border-slate-700/60 dark:bg-slate-900/80">
                <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#FFB800] text-[10px] text-white shadow-inner">
                  🪙
                </div>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                  1000
                </span>
              </div>
            </div>
          </header>
        </div>

        {/* MOBIL KONTENT */}
        <div className="w-full max-w-[100vw] space-y-4 overflow-hidden px-2 pt-4 pb-10">
          {/* 🚀 YANGILANGAN PREMIUM BANNER QISMI (Dark Mode bilan) */}
          <div className="w-full px-2">
            <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] dark:border-slate-800 dark:bg-slate-900/50">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-[32px] ring-1 ring-white/30 ring-inset dark:ring-white/5" />
              <BannerCarousel />
            </div>
          </div>

          {/* Tugmalar menyusi */}
          <div className="relative w-full p-4">
            {/* Orqa tarafdagi "blob" - dark rejimda kamroq ko'rinadi */}
            <div className="absolute top-0 right-0 -z-10 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="grid grid-cols-4 gap-x-3 gap-y-6">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className="group flex flex-col items-center gap-2"
                >
                  {/* Tugmaning DARK MODE'ga moslashuvchan uslubi */}
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-slate-200/50 bg-white shadow-[5px_5px_10px_rgba(0,0,0,0.05),-5px_-5px_10px_rgba(255,255,255,0.8)] transition-all active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[5px_5px_10px_rgba(0,0,0,0.4),-5px_-5px_10px_rgba(255,255,255,0.02)]">
                    <item.icon
                      className={`h-8 w-8 ${item.color ? item.color : "text-slate-800 dark:text-slate-200"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-center text-[11px] leading-tight font-semibold text-slate-800 dark:text-slate-300">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* JLPT Darajalari qismi */}
          <div className="flex flex-col gap-3">
            <div className="px-2">
              <h1 className="text-[20px] font-semibold text-slate-900 dark:text-white">
                Jlpt darajalari
              </h1>
            </div>
            <JlptLevels />
          </div>
        </div>
      </div>

      {/* =======================
          💻 DESKTOP KO'RINISh
      ======================== */}
      <div className="relative hidden w-full md:block">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex w-full flex-col"
        >
          {/* DESKTOP UCHUN SEZGIR NAVBAR */}
          <div
            className={`sticky top-0 z-40 flex w-full flex-col transition-transform duration-300 ease-in-out ${
              showNav ? "translate-y-0" : "-translate-y-[110%]"
            }`}
          >
            <div className="flex w-full items-center justify-center border-b border-slate-300 bg-slate-200/95 px-4 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
              <TabsList className="flex h-[5vh] w-full max-w-7xl justify-start gap-2 overflow-x-auto overflow-y-hidden bg-transparent p-0 px-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden">
                <TabsTrigger
                  value="jlpt"
                  onClick={() => setActiveTab("jlpt")}
                  className="relative flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-[13.5px] font-medium text-slate-600 transition-all outline-none hover:bg-slate-300/60 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800/80 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white"
                >
                  <Layers className="h-4 w-4" /> {t("main_page")}
                </TabsTrigger>

                {MENU_ITEMS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    onClick={(e) => {
                      e.preventDefault()
                      handleTabClick(tab)
                    }}
                    className="relative flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-[5px] text-[13.5px] font-medium text-slate-600 transition-all outline-none hover:bg-slate-300/60 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800/80 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white"
                  >
                    <tab.icon
                      className={`h-4 w-4 ${tab.color ? tab.color : ""}`}
                    />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex w-full items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeTab === "jlpt"
                  ? `${t("main_page")}`
                  : MENU_ITEMS.find((i) => i.id === activeTab)?.label}
              </h1>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExpandPage}
                  className="group flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  title="Sahifani to'liq ekranda ochish"
                >
                  <Maximize className="h-4 w-4 transition-transform group-hover:scale-110" />

                  {t("expansion")}
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[500px] w-full flex-1 flex-col bg-white dark:bg-slate-950">
            <TabsContent value="jlpt" className="mt-0 w-full p-0 outline-none">
              <div className="flex w-full flex-col">
                <div className="w-full min-w-0 overflow-hidden">
                  <BannerCarousel />
                </div>
                <div className="w-full px-4 pt-4 pb-6">
                  <JlptLevels />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="games" className="mt-0 w-full p-0 outline-none">
              <GamesList />
            </TabsContent>

            <TabsContent
              value="dictionary"
              className="mt-0 w-full p-0 outline-none"
            >
              <Lugat />
            </TabsContent>

            <TabsContent
              value="dokkai"
              className="mt-0 w-full p-0 outline-none"
            >
              <Dokkai />
            </TabsContent>

            <TabsContent value="kanji" className="mt-0 w-full p-0 outline-none">
              <Kanji />
            </TabsContent>

            <TabsContent value="shop" className="mt-0 w-full p-0 outline-none">
              <Shop />
            </TabsContent>

            <TabsContent
              value="translator"
              className="mt-0 w-full p-0 outline-none"
            >
              <Translate />
            </TabsContent>

            <TabsContent value="ai" className="mt-0 w-full p-0 outline-none">
              <AiComponent />
            </TabsContent>

            <TabsContent value="premium" className="w-full p-0 outline-none">
              <Premium />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
