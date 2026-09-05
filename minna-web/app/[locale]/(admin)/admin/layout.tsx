"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/sidebar/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Globe, Moon, Sun, Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  return (
    <SidebarProvider>
      {/* 🌟 ASOSIY WRAPPER (Toza oq va qora) */}
      <div className="flex h-[100dvh] w-full bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300 text-black dark:text-white">
        
        {/* 📱 / 💻 YON PANEL (Sidebar) */}
        <div className="z-20 h-full">
          <AdminSidebar />
        </div>

        {/* 🖥️ ASOSIY QISM */}
        <div className="flex w-full flex-1 flex-col relative z-10 overflow-hidden">
          
          {/* 🌟 HEADER */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-800">
            
            {/* Chap tomon: Mobil menu ochuvchi va Logo/Sarlavha */}
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <SidebarTrigger className="text-black dark:text-white" />
              </div>
              <span className="font-bold text-lg  sm:hidden">
                MinnaUz Admin
                </span>
            </div>

            {/* O'ng tomon: Qidiruv, Til va Dark Mode */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all flex items-center justify-center w-9 h-9 dark:bg-slate-900"
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Til o'zgartirish tugmasi */}
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all dark:bg-gray-900">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">UZ</span>
              </button>

              <div className="w-[1px] h-5 bg-gray-300 dark:bg-gray-800 mx-0.5"></div>

              {/* 🌗 Dark Mode Tugmasi */}
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all flex items-center justify-center w-9 h-9 dark:bg-slate-900"
                aria-label="Toggle Dark Mode"
              >
                {mounted && (
                  theme === "dark" ? (
                    <Sun className="w-4 h-4 text-white" /> 
                  ) : (
                    <Moon className="w-4 h-4 text-black" />
                  )
                )}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all flex items-center justify-center w-9 h-9 dark:bg-slate-900"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Kichraytirish" : "Kattalashtirish"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

            </div>
          </header>

          {/* 📄 ASOSIY SAHIFA */}
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-transparent">
            {children}
          </main>
          
        </div>
      </div>
    </SidebarProvider>
  );
}