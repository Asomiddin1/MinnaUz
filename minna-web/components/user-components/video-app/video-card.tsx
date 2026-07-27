"use client";
/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useTranslations } from "next-intl";
import Link from 'next/link';
import { Play, CheckCircle, MoreVertical } from 'lucide-react';

interface VideoProps {
  id: number | string;
  title: string;
  duration: string;
  thumbnail: string;
  progress?: number;
  views?: string;
  postedAt?: string;
  channelAvatar?: string;
}

export default function VideoCard({ video }: { video: VideoProps }) {
  const t = useTranslations("VideoCard");
  const isCompleted = video.progress === 100;

  return (
    <Link href={`/dashboard/video/${video.id}`} className="group flex flex-col gap-3 cursor-pointer w-full">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02]">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs px-2 py-0.5 rounded-md font-medium tracking-wide">
          {video.duration}
        </div>
        {video.progress !== undefined && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 backdrop-blur-sm">
            <div 
              className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-red-600'}`} 
              style={{ width: `${video.progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pr-2">
        <div className="flex-shrink-0 mt-1">
          <img 
            src={video.channelAvatar || "https://ui-avatars.com/api/?name=Minna+Uz&background=ef4444&color=fff"} 
            alt="Channel" 
            className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-800"
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-[15px] leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {video.title}
            </h4>
            <div className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mt-0.5 -mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-1.5 flex flex-col gap-0.5">
            <span className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{t("channel")}</span>
            <div className="flex items-center gap-1.5">
              <span>{video.views || t("views")}</span>
              <span className="text-[10px]">●</span>
              <span>{video.postedAt || t("ago")}</span>
            </div>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 mt-1.5 text-[12px] text-emerald-600 dark:text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              {t("completed")}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}