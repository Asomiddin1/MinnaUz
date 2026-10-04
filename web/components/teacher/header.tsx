'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, GraduationCap, Menu, PanelLeft, PanelLeftClose } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useThemeCtx } from '@/lib/theme';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { LogoMark } from '@/components/intro/Logo';

export function TeacherHeader({
  onMenuClick,
  isCollapsed,
  onToggleCollapse,
}: {
  onMenuClick?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { lang, t } = useLang();
  const { theme, toggle } = useThemeCtx();
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname.includes('/teacher/courses')) {
      return {
        title: t?.teacher?.header?.courses || 'Kurslarim & Darslar',
        sub: t?.teacher?.header?.coursesSub || 'Oʻzingizga biriktirilgan kurslar, modullar va dars materiallari',
      };
    }
    if (pathname.includes('/teacher/tests')) {
      return {
        title: t?.teacher?.header?.tests || 'Testlar & Savollar',
        sub: t?.teacher?.header?.testsSub || 'Kurslar uchun mock imtihonlar va savollar bazasi',
      };
    }
    if (pathname.includes('/teacher/students')) {
      return {
        title: t?.teacher?.header?.students || 'Oʻquvchilarim',
        sub: t?.teacher?.header?.studentsSub || 'Talabalarning oʻzlashtirish progressi va baholash',
      };
    }
    if (pathname.includes('/teacher/announcements')) {
      return {
        title: t?.teacher?.header?.announcements || 'Eʼlonlar yuborish',
        sub: t?.teacher?.header?.announcementsSub || 'Kurs talabalariga yangilik va xabarnomalar yuborish',
      };
    }
    return {
      title: t?.teacher?.header?.dashboard || 'Oʻqituvchi Boshqaruv Paneli',
      sub: t?.teacher?.header?.dashboardSub || 'Statistika, faollik va tezkor amallar',
    };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu, Desktop Collapse Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Sidebarni kengaytirish' : 'Sidebarni kichraytirish'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-[background-color,color,box-shadow] cursor-pointer shadow-2xs"
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 md:hidden">
          <LogoMark className="h-7 w-7" />
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
            TEACHER
          </span>
        </div>

        <div className="hidden sm:flex flex-col">
          <h2 className="text-sm font-bold text-foreground">
            {breadcrumb.title}
          </h2>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {breadcrumb.sub}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggle}
          title={theme === 'dark' ? 'Yorugʻ rejim' : 'Qorongʻu rejim'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-[background-color,color,box-shadow] cursor-pointer shadow-2xs"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Teacher Role Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Oʻqituvchi</span>
        </div>
      </div>
    </header>
  );
}
