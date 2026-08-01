"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";

export default function AppDownload() {
  const t = useTranslations("AppDownload");
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-40 bg-[#dcf2ff] flex flex-col items-center overflow-hidden"
    >
      {/* Parallax elementlar */}
      <motion.div style={{ y: y1 }} className="absolute left-[5%] top-[10%] text-8xl filter drop-shadow-2xl opacity-40">📱</motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[5%] top-[20%] text-9xl filter drop-shadow-2xl">🔥</motion.div>
      <motion.div style={{ y: y1 }} className="absolute left-[15%] bottom-[10%] text-7xl opacity-30">💎</motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[15%] bottom-[20%] text-8xl opacity-30 rotate-12">👑</motion.div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute left-[40%] top-[5%] text-5xl opacity-20">⚙️</motion.div>

      {/* Markaziy Kontent */}
      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="text-center mb-20">
          <h2 className="text-7xl md:text-[120px] font-[1000] text-[#042c60] leading-none tracking-tighter mb-6">
            {t("title")}
          </h2>
          <p className="text-xl md:text-2xl font-bold text-[#042c60]/60 max-w-2xl mx-auto">
            {t("desc")}
          </p>
        </motion.div>

        {/* Kartochkalar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20">
          <motion.div whileHover={{ y: -10 }} className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border-2 border-white shadow-xl flex flex-col items-center text-center group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
            <h3 className="text-2xl font-black text-[#042c60] mb-2">{t("japaneseTest")}</h3>
            <p className="text-gray-600 font-bold text-sm">{t("japaneseTestDesc")}</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border-2 border-white shadow-xl flex flex-col items-center text-center group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏫</div>
            <h3 className="text-2xl font-black text-[#042c60] mb-2">{t("forSchools")}</h3>
            <p className="text-gray-600 font-bold text-sm">{t("forSchoolsDesc")}</p>
          </motion.div>
        </div>

        {/* Ijtimoiy tarmoq tugmalari */}
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <a href="https://t.me/yapontilini_organamiz" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ y: -8 }}
              whileTap={{ y: 0 }}
              className="bg-white px-10 py-5 rounded-[2rem] flex items-center gap-4 border-b-[10px] border-[#229ED9]/50 active:border-b-0 transition-all shadow-2xl"
            >
              <span className="text-5xl text-[#229ED9]">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a11.96 11.96 0 0 0-.056 0m4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.666c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </span>
              <div className="text-left">
                <div className="text-[10px] font-black text-gray-400 uppercase">{t("joinUs")}</div>
                <div className="text-xl font-black text-[#042c60]">Telegram</div>
              </div>
            </motion.button>
          </a>

          <a href="https://www.instagram.com/minnaa.uz" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ y: -8 }}
              whileTap={{ y: 0 }}
              className="bg-white px-10 py-5 rounded-[2rem] flex items-center gap-4 border-b-[10px] border-[#E1306C]/50 active:border-b-0 transition-all shadow-2xl"
            >
              <span className="text-5xl text-[#E1306C]">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" /></svg>
              </span>
              <div className="text-left">
                <div className="text-[10px] font-black text-gray-400 uppercase">{t("followUs")}</div>
                <div className="text-xl font-black text-[#042c60]">Instagram</div>
              </div>
            </motion.button>
          </a>
        </div>
      </div>

      {/* Orqa fon nuqtali tekstura */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#042c60 2px, transparent 2px)", backgroundSize: "40px 40px" }}
      ></div>
    </section>
  );
}
