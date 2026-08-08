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
  level?: string;
  category?: string;
  minutes?: number;
}

const AVAILABLE_LANGUAGES = [
  { code: "ja", label: "日本語" },
  { code: "uz", label: "O'zbekcha" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" }
];

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const videoId = resolvedParams.id;
  
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["ja", "uz"]);
  const [follow, setFollow] = useState(true);
  const [bilingual, setBilingual] = useState(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  const transcriptRefs = useRef<(HTMLDivElement | null)[]>([]);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      const trans = currentVideo.transcript[lang];
      if (Array.isArray(trans)) {
        trans.forEach(line => {
          if (line && line.time) allTimes.add(line.time);
        });
      }
    });

    const sortedTimes = Array.from(allTimes).sort((a, b) => timeToSeconds(a) - timeToSeconds(b));

    return sortedTimes.map(time => {
      const texts: Record<string, string> = {};
      selectedLangs.forEach(lang => {
        const trans = currentVideo.transcript[lang];
        if (Array.isArray(trans)) {
          const match = trans.find(l => l && l.time === time);
          if (match) texts[lang] = match.text;
        }
      });
      return { time, texts };
    });
  }, [currentVideo, selectedLangs]);

  useEffect(() => {
    if (follow) {
      const container = containerRef.current;
      const target = transcriptRefs.current[activeSubtitle];
      
      if (container && target) {
        container.scrollTo({
          top: target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeSubtitle, follow]);

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
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#007AFF]" />
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center text-center">
        <p className="text-[15px] text-muted-foreground">Video topilmadi</p>
        <button 
          onClick={handleBack} 
          className="mt-4 rounded-full border border-border px-6 py-2.5 text-[13px] font-medium transition-colors duration-300 hover:bg-secondary"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const totalMinutes = currentVideo.minutes || 10;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
        Orqaga
      </button>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
        {/* Left: Video Player */}
        <div>
          <div className="overflow-hidden rounded-[24px] border border-border bg-black">
            <div className="relative aspect-video">
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
              />

              {!isPlaying && playedSeconds === 0 && (
                <div 
                  className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20"
                  onClick={() => setIsPlaying(true)}
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-110">
                    <Play className="h-8 w-8" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {currentVideo.level && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary">
                {currentVideo.level}
              </span>
            )}
            {currentVideo.category && (
              <span className="rounded-full bg-secondary px-3 py-1 text-[12px]">
                {currentVideo.category}
              </span>
            )}
            <span className="text-[12px] tabular-nums text-muted-foreground">
              {currentVideo.views?.toLocaleString() || 0} ko'rish · {totalMinutes} daqiqa
            </span>
          </div>

          <h1 className="headline mt-3 text-[clamp(1.5rem,3vw,2.1rem)]">
            {currentVideo.title}
          </h1>
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
            {currentVideo.description || "Tavsif mavjud emas."}
          </p>
        </div>

        {/* Right: Transcript Panel */}
        <aside className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[24px] border border-border bg-card xl:sticky xl:top-[5.5rem]">
          <div className="border-b border-border p-5">
            <h2 className="headline text-[18px]">Video matni</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Sarlavha va subtitrlar
            </p>

            <div className="mt-4 flex flex-wrap gap-1">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLangs.includes(lang.code);
                const hasText = currentVideo.transcript?.[lang.code]?.length > 0;
                if (!hasText) return null;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleLangToggle(lang.code)}
                    className={`rounded-full px-3 py-1.5 text-[12px] transition-all duration-300 ${
                      isSelected
                        ? 'bg-foreground font-medium text-background'
                        : 'border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted-foreground">
              {selectedLangs.length > 1 && (
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bilingual}
                    onChange={(e) => setBilingual(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[#007AFF]"
                  />
                  Ikki tilda
                </label>
              )}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={follow}
                  onChange={(e) => setFollow(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#007AFF]"
                />
                Avtomatik
              </label>
            </div>
          </div>

          {combinedTimeline.length === 0 ? (
            <p className="p-8 text-center text-[13px] text-muted-foreground">
              Video matni mavjud emas
            </p>
          ) : (
            <div 
              ref={containerRef}
              className="min-h-0 flex-1 overflow-y-auto p-2"
            >
              {combinedTimeline.map((item, index) => {
                const isActive = index === activeSubtitle;
                // Get Japanese text if available
                const jaText = item.texts.ja;
                // Get other languages (excluding Japanese)
                const otherLangs = selectedLangs.filter(lang => lang !== 'ja' && item.texts[lang]);
                
                return (
                  <div 
                    key={index}
                    ref={(el) => { transcriptRefs.current[index] = el; }}
                    onClick={() => handleTranscriptClick(index, item.time)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTranscriptClick(index, item.time);
                      }
                    }}
                    className={`flex w-full gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors duration-300 cursor-pointer ${
                      isActive ? 'bg-primary/10' : 'hover:bg-secondary'
                    }`}
                  >
                    <span
                      className={`mt-[3px] w-[38px] shrink-0 text-[11px] tabular-nums ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.time}
                    </span>
                    <span className="min-w-0 flex-1">
                      {/* Show Japanese text if bilingual is ON or only Japanese selected */}
                      {jaText && (bilingual || selectedLangs.length === 1) && (
                        <span className="font-jp block text-[13px] leading-relaxed text-muted-foreground">
                          {jaText}
                        </span>
                      )}
                      
                      {/* Show other languages */}
                      {otherLangs.map((langCode) => {
                        const text = item.texts[langCode];
                        if (!text) return null;
                        return (
                          <span
                            key={langCode}
                            className={`block text-[14px] leading-relaxed ${
                              isActive ? 'font-medium text-foreground' : 'text-foreground/85'
                            }`}
                          >
                            {text}
                          </span>
                        );
                      })}
                      
                      {/* If only Japanese is selected and bilingual is OFF */}
                      {jaText && selectedLangs.length === 1 && selectedLangs[0] === 'ja' && !bilingual && (
                        <span className={`block text-[14px] leading-relaxed font-jp ${
                          isActive ? 'font-medium text-foreground' : 'text-foreground/85'
                        }`}>
                          {jaText}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border p-4">
            <span className="text-[12px] tabular-nums text-muted-foreground">
              {clock(playedSeconds)} / {totalMinutes}:00
            </span>
            <button
              type="button"
              onClick={() => {
                if (playerRef.current) {
                  playerRef.current.seekTo(0, 'seconds');
                  setPlayedSeconds(0);
                  setActiveSubtitle(0);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[12px] transition-colors duration-300 hover:bg-secondary"
            >
              <Play className="h-4 w-4" />
              00:00
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}