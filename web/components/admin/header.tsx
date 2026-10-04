'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, ShieldCheck, ArrowUpRight, Menu } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useThemeCtx } from '@/lib/theme';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { LogoMark } from '@/components/intro/Logo';

export function AdminHeader({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const { lang, t } = useLang();
  const { theme, toggle } = useThemeCtx();
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname.includes('/admin/users')) {
      return {
        title: t?.admin?.header?.breadcrumbs?.users || 'Foydalanuvchilar',
        sub: t?.admin?.header?.breadcrumbs?.usersSub || 'Barcha oʻquvchilar, ustozlar va adminlar boshqaruvi',
      };
    }
    if (pathname.includes('/admin/courses')) {
      return {
        title: t?.admin?.header?.breadcrumbs?.courses || 'Kurslar',
        sub: t?.admin?.header?.breadcrumbs?.coursesSub || 'Darslar va modullar',
      };
    }
    if (pathname.includes('/admin/tests')) {
      return {
        title: t?.admin?.header?.breadcrumbs?.tests || 'JLPT Testlar',
        sub: t?.admin?.header?.breadcrumbs?.testsSub || 'Imtihon savollari bazasi',
      };
    }
    if (pathname.includes('/admin/shop')) {
      return {
        title: t?.admin?.header?.breadcrumbs?.shop || 'Raqamli Doʻkon',
        sub: t?.admin?.header?.breadcrumbs?.shopSub || 'Mahsulotlar va ramkalar boshqaruvi',
      };
    }
    if (pathname.includes('/admin/subscriptions')) {
      return {
        title: t?.admin?.header?.breadcrumbs?.subscriptions || 'Obunalar & VIP',
        sub: t?.admin?.header?.breadcrumbs?.subscriptionsSub || 'PRO foydalanuvchilar va toʻlovlar',
      };
    }
    if (pathname.includes('/admin/banners')) {
      return {
        title: t?.admin?.header?.breadcrumbs?.banners || 'Bannerlar',
        sub: t?.admin?.header?.breadcrumbs?.bannersSub || 'Eʼlonlar va aksiyalar boshqaruvi',
      };
    }
    if (pathname.includes('/admin/notifications')) {
      return {
        title: t?.admin?.header?.breadcrumbs?.notifications || 'Xabarnomalar',
        sub: t?.admin?.header?.breadcrumbs?.notificationsSub || 'Ommaviy bildirishnomalar yuborish',
      };
    }
    return {
      title: t?.admin?.header?.breadcrumbs?.dashboard || 'Boshqaruv paneli',
      sub: t?.admin?.header?.breadcrumbs?.dashboardSub || 'Platforma statistikasi va umumiy koʻrsatkichlar',
    };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card/85 px-3.5 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile Menu Trigger + Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Admin menyu"
          className="grid h-9 w-9 place-items-center rounded-xl border border-border text-foreground hover:bg-secondary active:scale-95 transition-[background-color,transform] md:hidden cursor-pointer"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/admin`}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            {t?.admin?.header?.title || 'Admin'}
          </Link>
          <span className="text-[13px] text-muted-foreground/60">/</span>
          <span className="text-[13px] font-semibold text-foreground">
            {breadcrumb.title}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link
          href={`/${lang}/dashboard`}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <span>{t?.admin?.header?.studentPanel || 'Oʻquvchi paneli'}</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>

        <LanguageSwitcher />

        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="grid h-8.5 w-8.5 sm:h-9 sm:w-9 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary cursor-pointer"
        >
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
