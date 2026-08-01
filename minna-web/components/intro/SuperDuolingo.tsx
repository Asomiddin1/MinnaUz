"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

const PremiumSection = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <section
    id={id}
    className={`relative w-full min-h-[70vh] flex items-center justify-center px-6 py-24 overflow-hidden scroll-mt-24 ${className}`}
  >
    {children}
  </section>
);

export default function PremiumPromo() {
  const t = useTranslations("SuperDuolingo");

  return (
    <div id="premium" className="relative w-full bg-[#0a0b26] font-sans scroll-mt-24">
      {/* 1. HERO */}
      <PremiumSection className="relative bg-[#050614]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
          <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2], x: [0, -50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        </div>

        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.7, rotateY: -20 }} whileInView={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ duration: 1, type: "spring", bounce: 0.4 }} className="relative w-full lg:w-1/2 flex justify-center items-center h-[400px] md:h-[550px] [perspective:1000px]">
            <motion.div animate={{ rotateZ: 360, rotateX: [20, -20, 20] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-72 h-72 md:w-[450px] md:h-[450px] border-[1px] border-cyan-400/30 rounded-full shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
            <motion.div animate={{ rotateZ: -360, rotateY: [20, -20, 20] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-64 h-64 md:w-[380px] md:h-[380px] border-[1px] border-fuchsia-500/30 rounded-full shadow-[0_0_40px_rgba(217,70,239,0.2)]" />
            <div className="relative group cursor-pointer">
              <motion.div animate={{ y: [-20, 20, -20], rotateY: [0, 15, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="text-[160px] md:text-[240px] relative z-20 drop-shadow-[0_0_80px_rgba(255,255,255,0.7)] select-none filter group-hover:brightness-110 transition-all">💎</motion.div>
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.2, 0.4] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-10 bg-cyan-400/40 blur-3xl rounded-full z-10" />
            </div>
          </motion.div>

          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-10">
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span></span>
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">{t("badge")}</span>
              </div>
              <h2 className="text-6xl md:text-[110px] font-[1000] italic leading-[0.8] tracking-tighter mb-8">
                <span className="text-white block mb-4 drop-shadow-2xl">{t("superTitle")}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#a855f7] to-[#f472b6] bg-[length:200%_auto] animate-gradient-x">{t("minnaTitle")}</span>
              </h2>
              <p className="text-indigo-100/70 text-xl md:text-2xl font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed">{t("desc")}</p>
              <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <Link href="/dashboard">
                  <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(34,211,238,0.4)" }} whileTap={{ scale: 0.95 }} className="relative bg-white text-[#050614] font-black py-6 px-14 rounded-[2rem] text-xl uppercase tracking-widest transition-all group overflow-hidden">
                    <span className="relative z-10">{t("cta")}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  </motion.button>
                </Link>
                <div className="text-white/40 font-bold text-sm uppercase tracking-widest border-l-2 border-white/10 pl-6 hidden sm:block"><br />{t("trial")}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </PremiumSection>

      {/* 2. REKLAMASIZ */}
      <PremiumSection className="bg-[#080920] border-y border-white/5">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">
          <div className="flex justify-center relative order-2 lg:order-1 h-[400px] items-center w-full max-w-[400px] mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.8, x: -50, rotate: -15 }} whileInView={{ opacity: 1, scale: 1, x: -30, rotate: -8 }} transition={{ duration: 0.5, delay: 0.2 }} className="absolute top-10 left-0 w-[240px] bg-white border border-gray-300 rounded-md shadow-2xl overflow-hidden z-0">
              <div className="flex justify-between items-center bg-gray-100 px-2 py-1 border-b border-gray-200"><span className="text-[10px] text-gray-500 font-sans flex items-center gap-1"><span className="text-blue-500">▶</span> AdChoices</span><span className="text-gray-400 text-xs cursor-pointer hover:bg-gray-200 px-1 rounded">✕</span></div>
              <div className="p-3 text-center bg-[#fff8e1]"><h4 className="text-red-600 font-black text-lg font-sans animate-pulse">WARNING!</h4><p className="text-black text-xs font-sans mt-1">Your device might be infected.</p><button className="mt-3 w-full bg-[#ff0000] text-white text-xs font-bold py-2 rounded-sm shadow-md">SCAN NOW</button></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="absolute bottom-10 right-0 w-[280px] bg-white border border-gray-300 rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden z-10">
              <div className="flex justify-between items-center px-2 py-1.5 border-b border-gray-200"><span className="text-[9px] text-gray-400 font-sans border border-gray-200 px-1 rounded-sm">Advertisement</span><span className="text-gray-500 text-xs font-bold bg-gray-100 w-5 h-5 flex items-center justify-center rounded-full">✕</span></div>
              <div className="p-4 flex flex-col items-center"><div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-2 shadow-lg shadow-blue-200">↓</div><h3 className="text-[#0000EE] text-xl font-bold font-sans text-center underline mb-1">START DOWNLOAD</h3><button className="w-full bg-[#28a745] text-white text-lg font-black py-3 rounded-lg shadow-md uppercase">Download</button></div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }} className="absolute inset-[-20px] bg-[#080920]/70 backdrop-blur-[12px] z-20 rounded-3xl flex flex-col items-center justify-center border border-indigo-500/20">
              <motion.div initial={{ scale: 0, y: 20 }} whileInView={{ scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 1.2 }} className="relative flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)] mb-4 border-4 border-[#080920] ring-2 ring-cyan-500/50">
                  <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div className="bg-[#0f112a] px-6 py-2 rounded-full border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] text-center"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-black text-xl tracking-[0.2em] uppercase">Ads Blocked</span></div>
              </motion.div>
            </motion.div>
          </div>
          <div className="space-y-6 text-center lg:text-left order-1 lg:order-2 z-10">
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tight">{t("adFree")}</h3>
            <p className="text-indigo-200/60 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">{t("adFreeDesc")}</p>
          </div>
        </div>
      </PremiumSection>

      {/* 3. YOPIQ O'YINLAR */}
      <PremiumSection>
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h3 className="text-4xl md:text-6xl font-black text-[#58cc02] uppercase italic leading-none">{t("games")}</h3>
            <p className="text-indigo-200/60 text-xl font-bold leading-relaxed">{t("gamesDesc")}</p>
          </div>
          <div className="flex justify-center relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-72 h-72 border-4 border-dashed border-green-500/20 rounded-full" />
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-[160px] drop-shadow-[0_0_50px_rgba(88,204,2,0.4)]">🎮</motion.div>
          </div>
        </div>
      </PremiumSection>

      {/* 4. VIDEO KURSLAR */}
      <PremiumSection className="bg-[#080920] border-y border-white/5">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative p-1 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-[2.8rem]">
              <div className="w-80 h-44 bg-slate-900 rounded-[2.6rem] flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center pl-1 shadow-xl"><div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-purple-600 border-b-[12px] border-b-transparent"></div></div>
              </div>
              <motion.div animate={{ scale: [1, 1.2, 1] }} className="absolute -top-4 -right-4 text-5xl">🎬</motion.div>
            </div>
          </div>
          <div className="space-y-6 text-center lg:text-left order-1 lg:order-2">
            <h3 className="text-4xl md:text-6xl font-black text-purple-400 uppercase italic">{t("videoCourses")}</h3>
            <p className="text-indigo-200/60 text-xl font-bold leading-relaxed">{t("videoCoursesDesc")}</p>
          </div>
        </div>
      </PremiumSection>

      {/* 5. TEST BAZASI */}
      <PremiumSection>
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            <h3 className="text-4xl md:text-6xl font-black text-cyan-400 uppercase italic leading-none">{t("testBase")}</h3>
            <p className="text-indigo-200/60 text-xl font-bold leading-relaxed">{t("testBaseDesc")}</p>
          </div>
          <div className="w-full flex justify-center relative order-1 lg:order-2 h-[450px] md:h-[500px]">
            <div className="relative w-full max-w-[450px] flex items-center justify-center h-full">
              <motion.div initial={{ rotate: -10, x: -20 }} whileInView={{ rotate: -5, x: -40 }} className="absolute z-10 w-[240px] md:w-[280px] h-[340px] md:h-[380px] bg-[#fdfdfb] rounded-sm shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 overflow-hidden" style={{ backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "100% 24px" }}>
                <div className="flex justify-between items-center border-b-2 border-slate-300 pb-2 bg-[#fdfdfb]"><div className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">JLPT Answer Sheet</div><div className="w-12 h-4 bg-slate-200 rounded-sm" /></div>
                <div className="space-y-3 md:space-y-4 pt-4">{[1, 2, 3, 4, 5, 6].map((q) => (<div key={q} className="flex items-center gap-3"><span className="text-[10px] font-bold text-slate-400 w-4">{q}.</span><div className="flex gap-2">{[1, 2, 3, 4].map((a) => (<div key={a} className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-slate-300 ${q === 1 && a === 2 ? "bg-slate-800" : q === 3 && a === 1 ? "bg-slate-800" : "bg-white"}`} />))}</div></div>))}</div>
              </motion.div>
              <motion.div initial={{ rotate: 5, y: 20 }} whileInView={{ rotate: 2, y: 0 }} className="absolute z-20 w-[260px] md:w-[300px] h-[360px] md:h-[400px] bg-white rounded-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-[12px] border-[#f8f5f0] p-6 md:p-8 flex flex-col items-center justify-between text-center overflow-hidden">
                <div className="relative"><div className="text-3xl md:text-4xl mb-2 md:mb-4">🏆</div><h4 className="text-[10px] md:text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">日本語能力試験</h4><div className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase">Japanese Language Proficiency Test</div></div>
                <div className="my-4 md:my-6"><div className="text-4xl md:text-5xl font-[1000] text-[#0213cc] tracking-tighter mb-2">N2</div><div className="h-1 w-16 md:w-20 bg-slate-100 mx-auto rounded-full" /><p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mt-4 tracking-[0.1em]">Certificate of Proficiency</p></div>
                <div className="w-full space-y-3"><div className="flex justify-between text-[9px] md:text-[10px] font-black text-slate-700 uppercase"><span>Vocabulary</span><span>60/60</span></div><div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-[#0213cc]" /></div></div>
              </motion.div>
              <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 md:-top-4 -right-2 md:-right-4 bg-white p-3 md:p-4 rounded-2xl shadow-xl border border-slate-50 z-30"><div className="text-xl md:text-2xl font-black text-[#0213cc]">N1</div></motion.div>
              <motion.div animate={{ x: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-12 md:bottom-10 -left-6 md:-left-12 bg-[#58cc02] text-white px-4 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl z-30 flex items-center gap-2 md:gap-3"><span className="text-lg md:text-xl">✅</span><span className="text-[9px] md:text-[10px] font-[1000] uppercase tracking-widest">Passed</span></motion.div>
            </div>
          </div>
        </div>
      </PremiumSection>

      {/* 6. SPECIAL OFFER */}
      <PremiumSection className="bg-gradient-to-b from-[#0a0b26] to-black py-20">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl w-full relative group">
          <div className="absolute inset-0 bg-yellow-400 blur-[80px] opacity-10"></div>
          <div className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 p-10 md:p-14 rounded-[4.5rem] shadow-2xl border-4 border-yellow-200 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
            <div className="text-8xl md:text-9xl z-10 drop-shadow-xl">🎁</div>
            <div className="flex-1 text-center md:text-left z-10">
              <div className="inline-block bg-[#0a0b26] text-yellow-400 text-[11px] font-black px-6 py-2 rounded-full mb-4 uppercase tracking-[0.2em] shadow-lg">{t("offerBadge")}</div>
              <h3 className="text-[#0a0b26] font-[1000] text-4xl md:text-6xl mb-3 uppercase leading-none tracking-tighter">{t("offerTitle")}</h3>
              <p className="text-[#1a1b3a] font-bold text-lg md:text-xl">{t("offerDesc")}</p>
            </div>
          </div>
        </motion.div>
      </PremiumSection>
    </div>
  );
}
