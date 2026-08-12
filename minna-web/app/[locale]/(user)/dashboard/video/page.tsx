"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { userAPI } from "@/lib/api/user";
import { PlayCircle, Sparkles, Eye, Clock, Loader2, Search } from 'lucide-react';

export default function VideoPage() {
  const t = useTranslations('VideoPage');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filter categories
  const filters = [
    { id: null, label: 'Barchasi' },
    { id: "Anime tili", label: 'Anime tili' },
    { id: "Yaponiyada hayot", label: 'Yaponiyada hayot' },
    { id: "Vloglar", label: 'Vloglar' },
    { id: "Madaniyat", label: 'Madaniyat' },
    { id: "Qiziqarli faktlar", label: 'Qiziqarli faktlar' },
    { id: "Shorts", label: 'Shorts' },
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const res = await userAPI.getVideos();
        const fetchedVideos = res.data?.data || res.data || [];
        
        const mappedVideos = fetchedVideos.map((video: any) => {
          const date = new Date(video.created_at);
          return {
            ...video,
            postedAt: `${date.getDate()}-${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`,
          };
        });

        setAllVideos(mappedVideos);
      } catch (err) {
        console.error("Videolarni yuklashda xatolik:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Filter videos by category and search query
  const filteredVideos = allVideos.filter((v: any) => {
    // Category filter
    if (activeFilter && v.category !== activeFilter) return false;
    // Search filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const searchText = `${v.title} ${v.category} ${v.description || ''}`.toLowerCase();
      return searchText.includes(q);
    }
    return true;
  });

  // Featured video (first one)
  const featuredVideo = allVideos.length > 0 ? allVideos[0] : null;

  // Recommended videos (exclude featured)
  const recommendedVideos = filteredVideos.slice(1);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#007AFF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <p className="text-red-500 font-medium">{t('errorMsg')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      
      {/* Featured Video (Banner) */}
      {!activeFilter && !query.trim() && featuredVideo && (
        <div className="group relative overflow-hidden rounded-[28px] border border-border bg-card transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 flex flex-col md:flex-row min-h-[300px] md:min-h-[380px]">
          {/* Subtle background decoration (glowing orbs) */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
          <div className="absolute bottom-0 left-[40%] -mb-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
          
          {/* Left Side: Full edge-to-edge image with Fade effect */}
          <div className="relative w-full aspect-[16/9] md:aspect-auto md:w-[50%] lg:w-[55%] shrink-0 z-0 overflow-hidden bg-secondary">
            <img
              src={featuredVideo.thumbnail || `https://i.ytimg.com/vi/${featuredVideo.youtubeId}/hqdefault.jpg`}
              alt={featuredVideo.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            
            {/* Fade gradients to blend image into the card background smoothly */}
            <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-card to-transparent hidden md:block" />
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-card to-transparent md:hidden" />
            
            <Link
              href={`/dashboard/video/${featuredVideo.id}`}
              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300 backdrop-blur-md">
                <PlayCircle className="h-8 w-8" fill="currentColor" />
              </span>
            </Link>
          </div>
          
          {/* Right Side: Text Content */}
          <div className="relative p-6 sm:p-8 md:p-10 flex flex-col justify-center flex-1 z-10 -mt-8 md:mt-0">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1.5 text-[13px] font-semibold text-primary shadow-sm border border-primary/10">
                🔥 Tavsiya etamiz
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-[13px] font-medium text-secondary-foreground shadow-sm border border-border/50">
                {featuredVideo.category || 'Yangi'}
              </span>
            </div>
            
            <h2 className="text-[24px] sm:text-[28px] lg:text-[34px] font-black leading-[1.15] tracking-tight text-foreground">
              {featuredVideo.title}
            </h2>
            
            <p className="mt-4 text-[15px] sm:text-[16px] lg:text-[17px] text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-4 font-medium">
              {featuredVideo.description || "Ushbu video orqali Yapon tili va madaniyati haqida eng qiziqarli ma'lumotlarni bilib oling."}
            </p>
            
            <div className="mt-8 flex flex-wrap items-center gap-4 text-[14px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-secondary/50 dark:bg-secondary/40 px-3.5 py-2 rounded-xl transition-colors border border-border/50 shadow-sm">
                <Eye className="h-[18px] w-[18px]" />
                {featuredVideo.views} marta
              </span>
              <span className="flex items-center gap-1.5 bg-secondary/50 dark:bg-secondary/40 px-3.5 py-2 rounded-xl transition-colors border border-border/50 shadow-sm">
                <Clock className="h-[18px] w-[18px]" />
                {featuredVideo.postedAt}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-2">
        
        {/* Categories (iOS Segmented Style) */}
        <div className="flex w-full xl:w-auto items-center min-w-0">
          <div className="flex gap-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/50 p-1.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] overflow-x-auto [scrollbar-width:none] max-w-full backdrop-blur-sm">
            {filters.map((filter) => (
              <button
                key={filter.id ?? 'all'}
                type="button"
                aria-pressed={filter.id === activeFilter}
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 whitespace-nowrap rounded-xl px-5 py-2.5 text-[14px] font-medium transition-all duration-300 ${
                  filter.id === activeFilter
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <label className="flex h-12 w-full xl:max-w-[340px] shrink-0 items-center gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 px-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-300 hover:shadow-md focus-within:border-primary/50 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-primary/10">
          <Search className="h-[18px] w-[18px] shrink-0 text-slate-400 transition-colors group-focus-within:text-primary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qiziqarli videolarni qidiring..."
            className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-[15px] font-medium text-muted-foreground">Videolar topilmadi</p>
          <p className="mt-1 text-[13px] text-muted-foreground/70">Boshqa so'z bilan qidirib ko'ring</p>
        </div>
      ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((v) => {
              // Hide the featured video from the grid if it's already shown in the banner
              if (!activeFilter && !query.trim() && featuredVideo && v.id === featuredVideo.id) {
                return null;
              }
              return (
                <Link
                key={v.id}
                href={`/dashboard/video/${v.id}`}
                className="group overflow-hidden rounded-[24px] border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-32px_rgba(0,0,0,0.45)]"
              >
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-secondary">
                  <img
                    src={v.thumbnail || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md">
                    {v.category || v.level}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-background/85 px-2 py-1 text-[11px] tabular-nums backdrop-blur-md">
                    {v.views} ko'rish
                  </span>
                  <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <PlayCircle className="h-[18px] w-[18px]" fill="currentColor" />
                  </span>
                </div>
                <div className="block px-5 py-4">
                  <div className="block text-[15px] font-medium leading-snug">{v.title}</div>
                  <div className="mt-1.5 block text-[13px] leading-relaxed text-muted-foreground">
                    {v.description || v.category}
                  </div>
                  <div className="mt-3 block text-[12px] tabular-nums text-muted-foreground">
                    {v.views} ko'rish
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
      )}
    </div>
  );
}