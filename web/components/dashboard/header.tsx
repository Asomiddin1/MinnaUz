'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Maximize2,
  Moon,
  Sun,
  Menu,
  Home,
  BookA,
  Gamepad2,
  BookOpen,
  Languages,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useThemeCtx } from '@/lib/theme';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { LogoMark } from '@/components/intro/Logo';
import { NotificationPopover } from './notification-popover';
import { useDashboardTab, type DashboardTabId } from './tab-context';
import { api } from '@/lib/api';
import type { ComponentType } from 'react';

// Kanji uchun maxsus stilizatsiyalangan haqiqiy '漢' ieroglif belgisi
function KanjiIcon({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-bold select-none leading-none ${className}`}
      style={{ fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      漢
    </span>
  );
}

export function DashboardHeader({
  onTabChange,
  onMenuClick,
  onSearchOpen,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onMenuClick?: () => void;
  onSearchOpen?: () => void;
}) {
  const { lang, t } = useLang();
  const hDict = t?.dashboardHeader;
  const pathname = usePathname();
  const { theme, toggle } = useThemeCtx();
  const { activeTab, setActiveTab } = useDashboardTab();
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const [headerCoins, setHeaderCoins] = React.useState<number | null>(null);
  const [dailyRewardToast, setDailyRewardToast] = React.useState<{
    message: string;
    coins: number;
  } | null>(null);

  // Global Cmd+K / Ctrl+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpen]);

  React.useEffect(() => {
    api
      .getUserCoins()
      .then((res) => setHeaderCoins(res.coins))
      .catch(() => {});

    // Automatically trigger daily streak check-in once per session
    const checkedToday = sessionStorage.getItem('minna_daily_checked');
    if (!checkedToday) {
      api
        .dailyCheckin()
        .then((res) => {
          sessionStorage.setItem('minna_daily_checked', 'true');
          if (!res.alreadyClaimed && res.earnedCoins) {
            setHeaderCoins(res.coins);
            setDailyRewardToast({ message: res.message, coins: res.earnedCoins });
            setTimeout(() => setDailyRewardToast(null), 5000);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const isDashboardHome = pathname ? /^\/([a-z]{2}\/)?dashboard\/?$/.test(pathname) : false;

  const tabs: { id: DashboardTabId; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t?.dash?.tabs?.[0] || 'Asosiy', icon: Home },
    { id: 'vocab', label: t?.dash?.tabs?.[1] || "Lug'at", icon: BookA },
    { id: 'games', label: t?.dash?.tabs?.[2] || "O'yinlar", icon: Gamepad2 },
    { id: 'dokkay', label: t?.dash?.tabs?.[3] || 'Dokkay', icon: BookOpen },
    { id: 'kanji', label: t?.dash?.tabs?.[4] || 'Kanji', icon: KanjiIcon },
    { id: 'store', label: t?.dash?.tabs?.[5] || "Do'kon", icon: ShoppingBag },
    { id: 'translate', label: t?.dash?.tabs?.[6] || 'Tarjimon', icon: Languages },
    { id: 'ai', label: t?.dash?.tabs?.[7] || 'AI ustoz', icon: Sparkles },
  ];

  const handleTabClick = (tabId: DashboardTabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex flex-col border-b border-border/80 bg-background/80 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 shadow-xs w-full">
        {/* Daily Reward Toast Notification */}
        {dailyRewardToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 max-w-md w-[90%] sm:w-auto">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500 text-black font-bold text-xs shadow-2xl border border-amber-300">
              <div className="flex items-center gap-2">
                <span className="text-base animate-bounce">🪙</span>
                <span>{dailyRewardToast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setDailyRewardToast(null)}
                aria-label="Bildirishnomani yopish"
                className="rounded-md p-1 hover:opacity-70 text-black font-black cursor-pointer text-sm shrink-0 ml-1 focus-visible:ring-2 focus-visible:ring-black/50"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Top Search & Actions Bar */}
        <div className="flex h-14 items-center justify-between gap-2.5 sm:gap-4 px-3.5 sm:px-6">
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label={hDict?.menuLabel || 'Menyu'}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border/70 text-foreground hover:bg-secondary active:scale-95 transition-[background-color,transform] cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link href={`/${lang}/dashboard`} className="flex items-center">
              <LogoMark className="h-8 w-8" />
            </Link>
          </div>

          {/* Universal Search Trigger */}
          <div className="relative hidden flex-1 max-w-md min-w-0 md:block">
            <button
              type="button"
              onClick={onSearchOpen}
              className="group relative flex h-9 w-full items-center justify-between rounded-xl border border-border/70 bg-secondary/35 px-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-border hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer active:scale-[0.99] shadow-2xs"
              title={hDict?.searchTitle || 'Universal qidiruv (Cmd+K / Ctrl+K)'}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="truncate text-[12px] sm:text-[13px] font-normal text-muted-foreground/80 group-hover:text-foreground/90 transition-colors">
                  {hDict?.searchPlaceholder || "Lug'at, kanji, bo'limlarni qidirish..."}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1 pl-2 shrink-0">
                <kbd className="inline-flex h-5 items-center gap-0.5 rounded-md border border-border/80 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs group-hover:border-foreground/20 group-hover:text-foreground transition-colors">
                  <span>⌘</span>
                  <span>K</span>
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {headerCoins !== null && (
              <button
                type="button"
                onClick={() => setActiveTab('store')}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors text-xs font-bold cursor-pointer shadow-2xs active:scale-95"
                title={hDict?.coinsTooltip || 'Minna Coin Balansi — Doʻkonga oʻtish'}
              >
                <span className="text-sm">🪙</span>
                <span>{headerCoins}</span>
              </button>
            )}

            <LanguageSwitcher />

            <NotificationPopover />

            <button
              type="button"
              onClick={toggle}
              aria-label={hDict?.themeToggle || 'Toggle theme'}
              className="hidden h-9 w-9 place-items-center rounded-xl border border-border/70 text-foreground transition-colors hover:bg-secondary cursor-pointer active:scale-95 md:grid"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={toggleFocusMode}
              aria-label={hDict?.fullscreen || 'Kengaytirish'}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3.5 h-9 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer active:scale-95"
            >
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{hDict?.fullscreen || 'Kengaytirish'}</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        {isDashboardHome && (
          <div className="w-full overflow-x-auto no-scrollbar border-t border-border/50 animate-in fade-in duration-200">
            <div className="flex w-max min-w-full items-center gap-1.5 px-3.5 sm:px-6 py-2 touch-pan-x">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`shrink-0 md:flex-1 min-w-max inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] sm:text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-foreground text-background shadow-xs font-semibold'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        tab.id === 'ai' && !isActive ? 'text-amber-500' : ''
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

    </>
  );
}