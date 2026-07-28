"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { userAPI } from "@/lib/api/user";
import { 
  Play, 
  Clock, 
  AlignLeft, 
  Volume2, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  Eye,
  Loader2,
  Languages,
  Check
} from 'lucide-react';
import ReactPlayer from 'react-player/youtube';

interface TranscriptLine {
  time: string;
  text: string;
}

interface VideoData {
  id: number;
  youtube_id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  created_at: string;
  postedAt?: string;
  transcript: Record<string, TranscriptLine[]>;
}

const AVAILABLE_LANGUAGES = [
  { code: "ja", label: "JA" },
  { code: "uz", label: "UZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" }
];

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const videoId = resolvedParams.id;
  
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["ja"]);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  const transcriptRefs = useRef<(HTMLDivElement | null)[]>([]);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true);
        setError(false);
        const res = await userAPI.getVideoById(Number(videoId));
        const videoData = res.data?.data || res.data;

        if (videoData) {
          const date = new Date(videoData.created_at);
          videoData.postedAt = `${date.getDate()}-${date.toLocaleString('uz-UZ', { month: 'short' })} ${date.getFullYear()}`;
          
          let parsedTranscript: Record<string, TranscriptLine[]> = { ja: [], uz: [], en: [], ru: [] };
          
          if (videoData.transcript) {
            if (typeof videoData.transcript === 'string') {
              try {
                const parsed = JSON.parse(videoData.transcript);
                parsedTranscript = Array.isArray(parsed) ? { ja: parsed, uz: [], en: [], ru: [] } : parsed;
              } catch (e) {
                console.error("Transcript JSON error:", e);
              }
            } else if (typeof videoData.transcript === 'object') {
              parsedTranscript = Array.isArray(videoData.transcript) ? { ja: videoData.transcript, uz: [], en: [], ru: [] } : videoData.transcript;
            }
          }
          
          videoData.transcript = parsedTranscript;
          setCurrentVideo(videoData);

          const availableLangs = Object.keys(parsedTranscript).filter(lang => parsedTranscript[lang]?.length > 0);
          const savedLangs = localStorage.getItem("user_preferred_langs");
          
          let initialLangs: string[] = ["ja"];
          
          if (savedLangs) {
            try {
              const parsedSaved = JSON.parse(savedLangs) as string[];
              const validSaved = parsedSaved.filter(l => availableLangs.includes(l));
              if (validSaved.length > 0) {
                initialLangs = validSaved.includes("ja") ? validSaved : ["ja", ...validSaved];
              } else {
                const additionalLang = availableLangs.find(l => l !== "ja");
                if (additionalLang) initialLangs.push(additionalLang);
              }
            } catch (e) {
              console.error("Error parsing saved languages:", e);
            }
          } else {
            const additionalLang = availableLangs.find(l => l !== "ja");
            if (additionalLang) initialLangs.push(additionalLang);
          }
          
          setSelectedLangs(initialLangs);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Video yuklashda xatolik:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const combinedTimeline = useMemo(() => {
    if (!currentVideo?.transcript || selectedLangs.length === 0) return [];

    const allTimes = new Set<string>();
    selectedLangs.forEach(lang => {
      (currentVideo.transcript[lang] || []).forEach(line => allTimes.add(line.time));
    });

    const sortedTimes = Array.from(allTimes).sort((a, b) => timeToSeconds(a) - timeToSeconds(b));

    return sortedTimes.map(time => {
      const texts: Record<string, string> = {};
      selectedLangs.forEach(lang => {
        const match = (currentVideo.transcript[lang] || []).find(l => l.time === time);
        if (match) texts[lang] = match.text;
      });
      return { time, texts };
    });
  }, [currentVideo, selectedLangs]);

  useEffect(() => {
    const container = document.getElementById("transcript-scroll-container");
    const target = transcriptRefs.current[activeSubtitle];
    
    if (container && target) {
      container.scrollTo({
        top: target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2,
        behavior: "smooth",
      });
    }
  }, [activeSubtitle]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
    
    if (combinedTimeline.length > 0) {
      const currentTime = state.playedSeconds;
      const newActiveIndex = combinedTimeline.findIndex((item, index) => {
        const currentLineTime = timeToSeconds(item.time);
        const nextLine = combinedTimeline[index + 1];
        const nextLineTime = nextLine ? timeToSeconds(nextLine.time) : Infinity;
        
        return currentTime >= currentLineTime && currentTime < nextLineTime;
      });
      
      if (newActiveIndex !== -1 && newActiveIndex !== activeSubtitle) {
        setActiveSubtitle(newActiveIndex);
      }
    }
  };

  const handleTranscriptClick = (index: number, timeStr: string) => {
    setActiveSubtitle(index);
    const seconds = timeToSeconds(timeStr);
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds');
    }
    if (!isPlaying) setIsPlaying(true);
  };

  const handleLangToggle = (langCode: string) => {
    let updated: string[];
    if (selectedLangs.includes(langCode)) {
      if (selectedLangs.length === 1) return; 
      updated = selectedLangs.filter(l => l !== langCode);
    } else {
      updated = [...selectedLangs, langCode];
    }
    setSelectedLangs(updated);
    localStorage.setItem("user_preferred_langs", JSON.stringify(updated));
  };

  const handleBack = () => {
    setIsPlaying(false);
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#0d1322]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#0d1322] text-gray-900 dark:text-white">
        <p className="text-red-500 dark:text-red-400 font-medium text-lg">Video topilmadi yoki yuklashda xatolik yuz berdi!</p>
        <button onClick={handleBack} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Orqaga qaytish</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-0 lg:p-6 h-[100dvh] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-0 lg:gap-6 overflow-hidden bg-white dark:bg-[#0d1322]">
      
      {/* CHAP TOMON: Video Player */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col shrink-0">
        <div className="relative z-30 w-full aspect-video bg-black lg:rounded-2xl overflow-hidden shadow-sm border-b lg:border border-gray-200 dark:border-[#172038]">
          <button onClick={handleBack} className="absolute top-4 left-4 z-40 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full border border-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${currentVideo.youtube_id}`}
            playing={isPlaying}
            controls={true}
            width="100%"
            height="100%"
            onProgress={handleProgress}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            config={{ 
              playerVars: { 
                autoplay: 0, 
                modestbranding: 1, 
                rel: 0,
                showinfo: 0
              } 
            }}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />

          {!isPlaying && playedSeconds === 0 && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20" onClick={() => setIsPlaying(true)}>
              <div className="w-20 h-20 bg-blue-600/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1.5" fill="currentColor" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col p-4 lg:p-5 bg-white dark:bg-[#0d1322] text-gray-900 dark:text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className={`text-[17px] lg:text-2xl font-bold text-gray-900 dark:text-white transition-all ${!isDetailsExpanded ? "line-clamp-1" : "line-clamp-3"}`}>
                {currentVideo.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {currentVideo.views?.toLocaleString() || 0} ko'rish</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {currentVideo.postedAt}</span>
              </div>
            </div>
            <button onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1.5 shrink-0 transition-colors">
              {isDetailsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDetailsExpanded ? "Yopish" : "Batafsil"}</span>
            </button>
          </div>
          {isDetailsExpanded && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#141c30] rounded-xl text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-fadeIn border border-gray-200 dark:border-[#1d2744]">
              {currentVideo.description || "Tavsif mavjud emas."}
            </div>
          )}
        </div>
      </div>

      {/* O'NG TOMON: Transkript */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0d1322] border-t lg:border border-gray-200 dark:border-[#172038] lg:rounded-2xl overflow-hidden mt-2 lg:mt-0">
        <div className="shrink-0 px-3 py-2.5 sm:p-4 border-b border-gray-200 dark:border-[#172038] flex items-center justify-between gap-2 bg-white dark:bg-[#0d1322] z-20">
          <div className="flex items-center gap-2 shrink-0">
            <AlignLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Video matni</h2>
          </div>
          
          {/* MOBIL UCHUN: Yashirin / Ochiladigan Til Menyusi (Dropdown) */}
          <div className="relative lg:hidden" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#141c30] hover:bg-gray-200 dark:hover:bg-[#1d2744] text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-[#1d2744]"
            >
              <Languages className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Tillar ({selectedLangs.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141c30] border border-gray-200 dark:border-[#1d2744] rounded-2xl shadow-xl p-1.5 z-50 animate-fadeIn">
                <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">Tillarni tanlang</div>
                {AVAILABLE_LANGUAGES.map(lang => {
                  const isSelected = selectedLangs.includes(lang.code);
                  const hasText = currentVideo.transcript?.[lang.code]?.length > 0;
                  if (!hasText) return null;

                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLangToggle(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1d2744]"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* WEB (DESKTOP) UCHUN: Gorizontal skrollanadigan tillar paneli */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-[#141c30] p-1 rounded-lg border border-gray-200 dark:border-[#1d2744] max-w-[280px] xl:max-w-[350px] overflow-x-auto no-scrollbar shrink-0">
            {AVAILABLE_LANGUAGES.map(lang => {
              const isSelected = selectedLangs.includes(lang.code);
              const hasText = currentVideo.transcript?.[lang.code]?.length > 0;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLangToggle(lang.code)}
                  disabled={!hasText}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all shrink-0 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : hasText
                      ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-[#1d2744]"
                      : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Languages className="w-3 h-3 opacity-60" />}
                  {lang.label}
                  {hasText && (
                    <span className={`w-1.5 h-1.5 rounded-full ml-0.5 ${isSelected ? "bg-white" : "bg-green-500"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Pastki menyu yopib qo'ymasligi uchun pb-28 saqlandi */}
        <div id="transcript-scroll-container" className="relative flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar pb-28 lg:pb-6">
          {combinedTimeline.length > 0 ? (
            combinedTimeline.map((item, index) => {
              const isActive = index === activeSubtitle;
              return (
                <div 
                  key={index}
                  ref={(el) => { transcriptRefs.current[index] = el; }}
                  onClick={() => handleTranscriptClick(index, item.time)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTranscriptClick(index, item.time); }}
                  className={`group flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-500 shadow-sm scale-[1.01]" 
                      : "hover:bg-gray-50 dark:hover:bg-[#141c30]/50 border-l-4 border-transparent"
                  }`}
                >
                  <div className={`font-mono text-xs font-semibold shrink-0 mt-0.5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                    {item.time}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1.5">
                    {selectedLangs.map((langCode) => {
                      const text = item.texts[langCode];
                      if (!text) return null;

                      const isJapanese = langCode === "ja";

                      return (
                        <div 
                          key={langCode} 
                          className={`leading-relaxed transition-colors ${
                            isActive 
                              ? "text-gray-900 dark:text-white" 
                              : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                          } ${
                            isJapanese 
                              ? "text-[16px] font-medium tracking-wide text-indigo-950 dark:text-indigo-200" 
                              : "text-[14px] opacity-90 italic text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {isActive && isJapanese && (
                            <Volume2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 inline mr-2 animate-pulse" />
                          )}
                          {text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
              <AlignLeft className="w-8 h-8 opacity-50" />
              <p className="text-sm italic">Video matni yuklanmagan yoki til tanlanmagan.</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}