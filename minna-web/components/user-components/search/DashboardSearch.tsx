"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, FileText, PlaySquare, GraduationCap, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import apiClient from "@/lib/api/axios";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchResult {
  grammars: any[];
  kanjis: any[];
  vocabularies: any[];
  videos: any[];
}

export function DashboardSearch() {
  const t = useTranslations("Dashboard");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 400);

  // Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const fetchSearch = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(res.data.data);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  };

  const hasResults =
    results &&
    (results.grammars?.length > 0 ||
      results.kanjis?.length > 0 ||
      results.vocabularies?.length > 0 ||
      results.videos?.length > 0);

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="group relative w-full">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-blue-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder={t("search") + " (Cmd+K)"}
          className="w-full rounded-full border border-slate-200 bg-[#F8FAFC] py-2 pr-10 pl-10 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-blue-500/30"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!query && (
          <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
            <span className="flex h-5 items-center rounded border border-slate-200 bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-[11px] mr-0.5">⌘</span>K
            </span>
          </div>
        )}
      </div>

      {isOpen && (query.trim() !== "") && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
          <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
                <p className="text-sm">Qidirilmoqda...</p>
              </div>
            ) : !hasResults ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Search className="h-10 w-10 text-slate-300 mb-2 dark:text-slate-600" />
                <p className="text-sm">Natija topilmadi</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Vocabulary */}
                {results.vocabularies?.length > 0 && (
                  <div>
                    <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Lug'at
                    </h3>
                    {results.vocabularies.map((v) => (
                      <Link
                        key={v.id}
                        href={`/dashboard/level/${v.level?.slug || 'n5'}/vocabulary`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                          <Type className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{v.word}</span>
                          <span className="text-xs text-slate-500">{v.meaning}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Grammar */}
                {results.grammars?.length > 0 && (
                  <div>
                    <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Grammatika
                    </h3>
                    {results.grammars.map((g) => (
                      <Link
                        key={g.id}
                        href={`/dashboard/level/${g.level?.slug || 'n5'}/grammar`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{g.title}</span>
                          <span className="text-xs text-slate-500">{g.meaning}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Kanji */}
                {results.kanjis?.length > 0 && (
                  <div>
                    <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Kanji
                    </h3>
                    {results.kanjis.map((k) => (
                      <Link
                        key={k.id}
                        href={`/dashboard/level/${k.level?.slug || 'n5'}/kanji`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                          <span className="font-bold text-lg leading-none">{k.character}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{k.meaning}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Videos */}
                {results.videos?.length > 0 && (
                  <div>
                    <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Video Darslar
                    </h3>
                    {results.videos.map((vid) => (
                      <Link
                        key={vid.id}
                        href={`/dashboard/video/${vid.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                          <PlaySquare className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium truncate">{vid.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
