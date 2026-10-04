'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Users,
  Bell,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  GraduationCap,
  LogOut,
  X,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { LogoMark } from '@/components/intro/Logo';
import { UserAvatar } from '@/components/shared/user-avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function TeacherSidebar({
  mobileOpen = false,
  onMobileClose,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse: controlledToggleCollapse,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { lang, t } = useLang();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (controlledIsCollapsed === undefined) {
      const saved = localStorage.getItem('minna-teacher-sidebar-collapsed');
      if (saved === 'true') {
        setInternalCollapsed(true);
      }
    }
  }, [controlledIsCollapsed]);

  const isCollapsed =
    controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (controlledToggleCollapse) {
      controlledToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('minna-teacher-sidebar-collapsed', String(next));
        return next;
      });
    }
  };

  const navItems: NavItem[] = [
    {
      label: t?.teacher?.sidebar?.dashboard || 'Boshqaruv paneli',
      href: `/${lang}/teacher`,
      icon: LayoutDashboard,
    },
    {
      label: t?.teacher?.sidebar?.courses || 'Kurslarim & Darslar',
      href: `/${lang}/teacher/courses`,
      icon: BookOpen,
    },
    {
      label: t?.teacher?.sidebar?.tests || 'Testlar & Savollar',
      href: `/${lang}/teacher/tests`,
      icon: FileCheck2,
    },
    {
      label: t?.teacher?.sidebar?.students || 'Oʻquvchilarim',
      href: `/${lang}/teacher/students`,
      icon: Users,
    },
    {
      label: t?.teacher?.sidebar?.announcements || 'Eʼlonlar yuborish',
      href: `/${lang}/teacher/announcements`,
      icon: Bell,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${lang}/teacher`) {
      return pathname === `/${lang}/teacher`;
    }
    return pathname.startsWith(href);
  };

  const renderContent = (isMobileDrawer = false) => (
    <div className="flex h-full flex-col bg-card border-r border-border/80 select-none">
      {/* 1. Header with Logo & Title */}
      {isMobileDrawer || !isCollapsed ? (
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
          <Link
            href={`/${lang}/teacher`}
            onClick={isMobileDrawer ? onMobileClose : undefined}
            className="flex items-center gap-3 min-w-0"
          >
            <LogoMark className="h-9 w-9 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-foreground truncate">
                MinnaUz
              </span>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="h-2.5 w-2.5" />
                  <span>TEACHER</span>
                </span>
              </div>
            </div>
          </Link>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Sidebarni kichraytirish"
              className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center border-b border-border/60 px-2">
          <Link
            href={`/${lang}/teacher`}
            title="MinnaUz Teacher"
            className="flex items-center justify-center p-1.5 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            <LogoMark className="h-9 w-9 shrink-0" />
          </Link>
        </div>
      )}

      {/* 2. Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-none">
        {!isMobileDrawer && isCollapsed && (
          <div className="pb-2 mb-2 border-b border-border/50 flex justify-center">
            <button
              type="button"
              onClick={toggleCollapse}
              title="Sidebarni kengaytirish"
              className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobileDrawer ? onMobileClose : undefined}
              title={!isMobileDrawer && isCollapsed ? item.label : undefined}
              className={`group flex items-center rounded-xl text-xs font-semibold transition-[background-color,color,box-shadow] duration-150 cursor-pointer ${
                !isMobileDrawer && isCollapsed
                  ? 'h-10 w-10 justify-center mx-auto'
                  : 'gap-3 px-3 py-2.5'
              } ${
                active
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
              }`}
            >
              <Icon
                className={`shrink-0 transition-transform ${
                  !isMobileDrawer && isCollapsed ? 'h-5 w-5' : 'h-4 w-4'
                } ${active ? 'scale-105' : 'group-hover:scale-105'}`}
              />

              {(isMobileDrawer || !isCollapsed) && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer with Return to Student App & User profile */}
      <div className="border-t border-border/60 p-3 space-y-2">
        {/* Return to Student Dashboard */}
        <Link
          href={`/${lang}/dashboard`}
          onClick={isMobileDrawer ? onMobileClose : undefined}
          title={!isMobileDrawer && isCollapsed ? 'Oʻquvchi paneliga qaytish' : undefined}
          className={`flex items-center rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors ${
            !isMobileDrawer && isCollapsed
              ? 'h-10 w-10 justify-center mx-auto'
              : 'gap-2.5 px-3 py-2'
          }`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-primary" />
          {(isMobileDrawer || !isCollapsed) && (
            <span className="truncate">Oʻquvchi paneliga qaytish</span>
          )}
        </Link>

        {/* User Card */}
        <div
          className={`flex items-center rounded-xl bg-secondary/30 p-2 ${
            !isMobileDrawer && isCollapsed ? 'justify-center' : 'justify-between gap-2'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar
              src={user?.avatarUrl}
              name={user?.fullName}
              size="sm"
            />
            {(isMobileDrawer || !isCollapsed) && (
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-foreground truncate">
                  {user?.fullName || user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Oʻqituvchi
                </span>
              </div>
            )}
          </div>

          {(isMobileDrawer || !isCollapsed) && (
            <button
              type="button"
              onClick={logout}
              title="Chiqish"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-[width] duration-200 shrink-0 ${
          isCollapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        <div className="sticky top-0 h-screen">
          {renderContent(false)}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-[270px] bg-card shadow-2xl animate-in slide-in-from-left">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
