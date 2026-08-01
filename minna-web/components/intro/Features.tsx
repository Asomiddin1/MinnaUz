"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type PremiumHeaderProps = {
  badge: string;
  title: ReactNode;
  desc: string;
  accentColor: string;
  badgeBg: string;
};

const PremiumHeader = ({ badge, title, desc, accentColor, badgeBg }: PremiumHeaderProps) => (
  <div className="relative z-10 space-y-6 max-w-xl">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${badgeBg} ${accentColor} border border-white/40 shadow-sm`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${accentColor.replace("text", "bg")} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${accentColor.replace("text", "bg")}`}></span>
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{badge}</span>
    </motion.div>

    <h2 className="text-5xl md:text-7xl font-[1000] text-slate-900 leading-[0.95] tracking-tighter">
      {title}
    </h2>

    <p className="text-lg text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default function Features() {
  const t = useTranslations("Features");

  return (
    <div className="relative w-full bg-[#fcfcfd] flex flex-col items-center">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-orange-50 rounded-full blur-[100px]" />
      </div>

      {/* 1. GAMIFICATION */}
      <section className="w-full max-w-7xl py-32 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative">
        <PremiumHeader
          badge={t("gamification")}
          title={
            t.rich("gamificationTitle", {
              highlight: (chunks) => (
                <>
                  <br />
                  <span className="text-green-500">{chunks}</span>
                </>
              ),
            })
          }
          desc={t("gamificationDesc")}
          accentColor="text-green-600"
          badgeBg="bg-green-50"
        />

        <div className="relative h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-[3.5rem] border border-white shadow-2xl overflow-hidden p-8">
            <div className="flex flex-col gap-6 h-full justify-center">
              {[70, 45, 90].map((w, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between font-black text-xs text-slate-400">
                    <span>LEVEL {i + 1}</span>
                    <span>{w}%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-2xl p-1 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${w}%` }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                      className={`h-full rounded-xl shadow-lg ${i === 0 ? "bg-green-500" : i === 1 ? "bg-blue-500" : "bg-yellow-500"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-10 right-10 bg-yellow-400 text-white font-black p-4 rounded-3xl shadow-xl text-xl">
              +500 XP
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STREAK */}
      <section className="w-full max-w-7xl py-32 px-6 md:px-12 flex flex-col lg:flex-row-reverse items-center gap-20 relative">
        <PremiumHeader
          badge={t("streak")}
          title={
            t.rich("streakTitle", {
              highlight: (chunks) => (
                <>
                  <br />
                  <span className="text-orange-500">{chunks}</span>
                </>
              ),
            })
          }
          desc={t("streakDesc")}
          accentColor="text-orange-600"
          badgeBg="bg-orange-50"
        />

        <div className="lg:w-1/2 flex justify-center relative">
          <motion.div
            whileHover={{ scale: 1.02, rotate: -1 }}
            className="w-full max-w-md aspect-square bg-gradient-to-br from-white to-slate-50 rounded-[4rem] shadow-2xl border border-white flex flex-col items-center justify-center relative overflow-hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[160px] relative z-10 drop-shadow-[0_20px_40px_rgba(249,115,22,0.4)]"
            >
              🔥
            </motion.div>
            <h3 className="text-6xl font-[1000] text-slate-800 relative z-10 tracking-tighter">
              {t("streakDaily")}
            </h3>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]" />
          </motion.div>
        </div>
      </section>

      {/* 3. AI */}
      <section className="w-full max-w-7xl py-32 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <PremiumHeader
          badge={t("ai")}
          title={
            t.rich("aiTitle", {
              highlight: (chunks) => (
                <>
                  <br />
                  <span className="text-blue-500">{chunks}</span>
                </>
              ),
            })
          }
          desc={t("aiDesc")}
          accentColor="text-blue-600"
          badgeBg="bg-blue-50"
        />

        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[4rem] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
          <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white shadow-2xl">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="h-24 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-1"
                >
                  <div className="w-8 h-1 bg-blue-500/20 rounded-full overflow-hidden">
                    <motion.div animate={{ x: [-20, 20] }} transition={{ repeat: Infinity, duration: 1 }} className="h-full w-4 bg-blue-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400">ANALYZING...</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-4 bg-blue-500 p-4 rounded-3xl">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🧑🏻‍💻</div>
              <div className="text-white text-xs font-bold leading-tight">{t("aiNote")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SCHOOLS */}
      <section className="w-full max-w-7xl py-32 px-6 md:px-12 flex flex-col lg:flex-row-reverse items-center gap-20">
        <PremiumHeader
          badge={t("enterprise")}
          title={
            t.rich("enterpriseTitle", {
              highlight: (chunks) => (
                <>
                  <br />
                  <span className="text-purple-600">{chunks}</span>
                </>
              ),
            })
          }
          desc={t("enterpriseDesc")}
          accentColor="text-purple-600"
          badgeBg="bg-purple-50"
        />

        <div className="lg:w-1/2 w-full">
          <div className="bg-[#1e293b] p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-slate-500 font-mono text-[10px]">minna-admin-v1.0</span>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 10 }}
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl" />
                    <div className="h-3 w-24 bg-white/10 rounded-full" />
                  </div>
                  <div className="h-6 w-16 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
