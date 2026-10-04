'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  PlayCircle,
  Sparkles,
  Search,
  CheckCheck,
  ArrowRight,
  Inbox,
  RefreshCw,
  Video,
  Tag,
  Zap,
} from 'lucide-react';
import { api, NotificationItem } from '@/lib/api';
import { useLang } from '@/lib/i18n';

const TYPE_CONFIG = {
  PROMO: {
    label: 'Aksiya',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-500',
    icon: Sparkles,
  },
  UPDATE: {
    label: 'Yangilanish',
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    iconBg: 'bg-purple-500/10 text-purple-500',
    icon: Zap,
  },
  SYSTEM: {
    label: 'Tizim',
    badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    iconBg: 'bg-rose-500/10 text-rose-500',
    icon: Bell,
  },
  ANNOUNCEMENT: {
    label: 'Eʼlon',
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    iconBg: 'bg-blue-500/10 text-blue-500',
    icon: Tag,
  },
};

export default function NotificationsPage() {
  const { lang } = useLang();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'UNREAD' | 'ANNOUNCEMENT' | 'UPDATE' | 'PROMO'>('ALL');

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const list = await api.getUserNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'UNREAD' && notif.isRead) return false;
    if (activeFilter === 'ANNOUNCEMENT' && notif.type !== 'ANNOUNCEMENT') return false;
    if (activeFilter === 'UPDATE' && notif.type !== 'UPDATE') return false;
    if (activeFilter === 'PROMO' && notif.type !== 'PROMO') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        notif.title.toLowerCase().includes(q) ||
        notif.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
      {/* Header */}
      <div className="border-b border-border/70 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary">
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                Bildirishnomalar
              </span>
              {unreadCount > 0 && (
                <span className="flex items-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold animate-pulse">
                  +{unreadCount} yangi
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Xabarnomalar markazi
            </h1>
            <p className="text-sm text-muted-foreground">
              Platforma yangiliklari, video darslar va muhim eslatmalar bir joyda.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:bg-secondary text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <CheckCheck className="h-4 w-4 text-primary" />
                <span>Oʻqilgan qilish</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center p-2.5 rounded-2xl bg-card border border-border/60 hover:bg-secondary text-foreground transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Yangilash"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-2xl bg-secondary/30 border border-border/40">
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'UNREAD', label: `Oʻqilmagan`, count: unreadCount },
            { id: 'ANNOUNCEMENT', label: 'Eʼlonlar' },
            { id: 'UPDATE', label: 'Yangiliklar' },
            { id: 'PROMO', label: 'Aksiyalar' },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-card text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidirish..."
            className="w-full h-10 pl-9 pr-4 rounded-2xl border border-border/50 bg-card/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-border/50 bg-card/40 p-12 text-center text-sm text-muted-foreground backdrop-blur-xs">
            Yuklanmoqda...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-secondary text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Hech qanday bildirishnoma topilmadi</p>
            <p className="text-xs text-muted-foreground">Tanlangan filtr boʻyicha maʼlumot mavjud emas.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.ANNOUNCEMENT;
            const Icon = notif.videoUrl ? PlayCircle : config.icon;

            return (
              <Link
                key={notif.id}
                href={`/${lang}/dashboard/notifications/${notif.id}`}
                className="group block relative overflow-hidden rounded-2xl border border-border/60 bg-card hover:bg-secondary/20 hover:border-border transition-all duration-200 hover:shadow-md active:scale-[0.99]"
              >
                {!notif.isRead && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}

                <div className="p-4 sm:p-5 flex items-start gap-4">
                  <div
                    className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      notif.videoUrl ? 'bg-rose-500/10 text-rose-500' : config.iconBg
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${config.badge}`}>
                        {config.label}
                      </span>

                      {notif.videoUrl && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-medium">
                          <Video className="h-3 w-3" />
                          Video
                        </span>
                      )}

                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}

                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className={`text-sm sm:text-base leading-snug truncate ${!notif.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}>
                      {notif.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground group-hover:text-foreground group-hover:bg-secondary transition-all shrink-0 self-center">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}