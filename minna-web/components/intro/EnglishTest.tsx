"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export default function EnglishTest() {
  const t = useTranslations("EnglishTest");

  return (
    <section className="w-full py-32 px-6 bg-white overflow-hidden relative">
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-50/50 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* MATN QISMI */}
        <div className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-[1000] uppercase tracking-[0.2em] mb-8 border border-indigo-100">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              {t("badge")}
            </div>

            <h2 className="text-5xl md:text-7xl font-[1000] text-slate-900 leading-[0.95] tracking-tighter mb-8">
              {t("title")} <br />
              <span className="text-[#0213cc]">{t("titleHighlight")}</span>
            </h2>

            <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t("desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
              <Link href="/dashboard">
                <button className="w-full sm:w-auto bg-[#0213cc] text-white font-black py-5 px-12 rounded-[2rem] text-sm uppercase tracking-widest border-b-[6px] border-[#0a0b80] active:border-b-0 active:translate-y-1 transition-all shadow-xl shadow-indigo-100">
                  {t("cta")}
                </button>
              </Link>
              <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest leading-tight">
                {t("levels")}
              </div>
            </div>
          </motion.div>
        </div>

        {/* VIZUAL QISM */}
        <div className="w-full lg:w-1/2 flex justify-center relative order-1 lg:order-2 h-[400px] md:h-[500px] items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-full max-w-[320px] md:max-w-[380px] aspect-[3/4] group cursor-pointer z-20"
          >
            <div className="absolute inset-0 bg-slate-50 border border-slate-200 rounded-2xl transform -rotate-6 -translate-x-4 translate-y-4 -z-20 transition-all duration-500 group-hover:-rotate-12 group-hover:-translate-x-8 group-hover:translate-y-6" />
            <div className="absolute inset-0 bg-slate-100 border border-slate-200 rounded-2xl transform rotate-3 translate-x-4 translate-y-2 -z-10 transition-all duration-500 group-hover:rotate-8 group-hover:translate-x-8 group-hover:translate-y-4" />
            <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden border border-slate-100 z-20 transition-transform duration-500 group-hover:-translate-y-2">
              <img
                src="/images/jlpt.png"
                alt="JLPT Real Test"
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 md:top-10 -right-2 md:-right-8 bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl border border-white/20 z-30"
          >
            <div className="text-xl md:text-2xl font-black text-cyan-300">N1 - N5</div>
          </motion.div>

          <motion.div
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 md:bottom-16 -left-4 md:-left-12 bg-[#58cc02] text-white px-4 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl z-30 flex items-center gap-2 md:gap-3"
          >
            <span className="text-lg md:text-xl">✅</span>
            <span className="text-[9px] md:text-[11px] font-[1000] uppercase tracking-widest">Haqiqiy Test</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
