'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TeacherSidebar } from '@/components/teacher/sidebar';
import { TeacherHeader } from '@/components/teacher/header';
import { useAuth } from '@/lib/auth-context';
import { useLang } from '@/lib/i18n';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, GraduationCap } from 'lucide-react';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    const saved = localStorage.getItem('minna-teacher-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('minna-teacher-sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  const isTeacherOrAdmin =
    user?.role === 'TEACHER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN';

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/${lang}/auth/login`);
      }
    }
  }, [isLoading, isAuthenticated, lang, router]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[13px] text-muted-foreground font-semibold">
            Oʻqituvchi paneli yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isTeacherOrAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive text-2xl">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black text-foreground">
            Ruxsat berilmagan
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Oʻqituvchi paneliga kirish faqat <strong>TEACHER</strong> yoki <strong>ADMIN</strong> huquqiga ega foydalanuvchilar uchun ruxsat etilgan.
          </p>
          <div className="pt-2">
            <Link
              href={`/${lang}/dashboard`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-all shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Oʻquvchi paneliga qaytish</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <TeacherHeader
          onMenuClick={() => setMobileOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
