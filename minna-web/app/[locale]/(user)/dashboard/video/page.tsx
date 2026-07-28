"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import VideoCard from '@/components/user-components/video-app/video-card';
import { userAPI } from "@/lib/api/user";
import { PlayCircle, Sparkles, Eye, Clock, Loader2 } from 'lucide-react';

export default function VideoPage() {
  const t = useTranslations('VideoPage');
  const [activeFilter, setActiveFilter] = useState("Barchasi");
  
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const filters = [
    { id: "Barchasi", label: t('filters.all') },
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

  const filteredVideos = activeFilter === "Barchasi" 
    ? allVideos.slice(1) 
    : allVideos.filter((v: any) => v.category === activeFilter);

  const featuredVideo = allVideos.length > 0 ? allVideos[0] : null;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-red-500 font-medium">{t('errorMsg')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6">
      
      {/* Asosiy oq/dark karta konteyneri */}
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 md:p-6 lg:p-8 space-y-8 shadow-sm">
        
        {/* 1. KATTA BANNER */}
        {activeFilter === "Barchasi" && featuredVideo && (
          <div className="relative w-full aspect-[16/9] md:aspect-[2.2/1] overflow-hidden rounded-2xl shadow-md group">
            <img 
              src={featuredVideo.thumbnail} 
              alt={featuredVideo.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full md:w-3/4 lg:w-2/3 flex flex-col justify-end h-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-violet-600/90 backdrop-blur-md text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> {t('newLesson')}
                </span>
                <span className="text-slate-300 text-xs md:text-sm font-medium">{featuredVideo.category}</span>
              </div>
              
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg line-clamp-2">
                {featuredVideo.title}
              </h1>

              <div className="flex items-center gap-3 mb-4 text-slate-300 text-xs md:text-sm font-medium">
                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Eye className="w-3.5 h-3.5" /> {featuredVideo.views}
                </span>
                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Clock className="w-3.5 h-3.5" /> {featuredVideo.postedAt}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/video/${featuredVideo.id}`} 
                      className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md shadow-violet-500/25 transition-all duration-300 w-full sm:w-auto">
                  <PlayCircle className="w-4 h-4" fill="currentColor" />
                  {t('watch')}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. ZAMONAVIY FILTRLAR */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-2">
          <div className="flex gap-6 overflow-x-auto snap-x scroll-smooth no-scrollbar items-center">
            {filters.map((filter, index) => (
              <button 
                key={index}
                onClick={() => setActiveFilter(filter.id)}
                className={`snap-start whitespace-nowrap py-3 text-xs md:text-sm font-bold transition-all duration-300 relative ${
                  activeFilter === filter.id 
                  ? "text-violet-600 dark:text-violet-400" 
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {filter.label}
                {activeFilter === filter.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-violet-600 dark:bg-violet-400 rounded-t-full shadow-[0_-2px_10px_rgba(124,58,237,0.5)]"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. VIDEOLAR RO'YXATI (Videolar atrofidagi fon va padding butunlay olib tashlandi) */}
        <div className="pb-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-6">
            {activeFilter === "Barchasi" 
              ? t('recommended') 
              : t('categoryVideos', { 
                  category: filters.find(f => f.id === activeFilter)?.label || activeFilter 
                })}
          </h2>

          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video: any) => (
                <div key={video.id} className="w-full">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('noVideos')}</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}