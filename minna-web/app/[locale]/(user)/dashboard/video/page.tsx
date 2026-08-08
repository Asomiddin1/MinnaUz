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
    { id: null, label: t('filters.all') },
    { id: "Anime tili", label: t('filters.anime') },
    { id: "Yaponiyada hayot", label: t('filters.life') },
    { id: "Vloglar", label: t('filters.vlogs') },
    { id: "Madaniyat", label: t('filters.culture') },
    { id: "Qiziqarli faktlar", label: t('filters.facts') },
    { id: "Shorts", label: t('filters.shorts') },
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
      {/* Header */}
      <h1 className="headline text-[30px]">{t('title')}</h1>
      <p className="mt-2 max-w-[56ch] text-[15px] text-muted-foreground">{t('sub')}</p>

      {/* Search & Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-card px-4 transition-colors duration-300 focus-within:border-[#007AFF]/40 sm:max-w-[320px]">
          <Search className="h-[17px] w-[17px] shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex gap-1 rounded-full border border-border p-1 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id ?? 'all'}
              type="button"
              aria-pressed={filter.id === activeFilter}
              onClick={() => setActiveFilter(filter.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] transition-all duration-300 ${
                filter.id === activeFilter
                  ? 'bg-foreground font-medium text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <span className="text-[13px] text-muted-foreground">
          {filteredVideos.length} {t('lessons')}
        </span>
      </div>

      {filteredVideos.length === 0 ? (
        <p className="mt-16 text-center text-[14px] text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Featured Video */}
          {!activeFilter && featuredVideo && (
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-card transition-all duration-500 hover:shadow-[0_24px_50px_-32px_rgba(0,0,0,0.45)]">
              <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                <img
                  src={featuredVideo.thumbnail || `https://i.ytimg.com/vi/${featuredVideo.youtubeId}/hqdefault.jpg`}
                  alt={featuredVideo.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md">
                  {featuredVideo.category || 'Yangi'}
                </span>
                
                <span className="absolute bottom-3 right-3 rounded-full bg-background/85 px-2 py-1 text-[11px] tabular-nums backdrop-blur-md">
                  {featuredVideo.views} {t('views')}
                </span>
                
                <Link
                  href={`/dashboard/video/${featuredVideo.id}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl">
                    <PlayCircle className="h-8 w-8" fill="currentColor" />
                  </span>
                </Link>
              </div>
              
              <div className="p-6">
                <h2 className="text-[22px] font-bold leading-snug">{featuredVideo.title}</h2>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  {featuredVideo.description || featuredVideo.category}
                </p>
                <div className="mt-4 flex items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {featuredVideo.views}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {featuredVideo.postedAt}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Video Grid */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(activeFilter ? filteredVideos : recommendedVideos).map((v) => (
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
                    {v.views} {t('views')}
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
                    {v.views} {t('views')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}