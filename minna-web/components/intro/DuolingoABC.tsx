"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export default function DuolingoABC() {
  const t = useTranslations("DuolingoABC");

  return (
    <section className="w-full py-32 px-6 bg-[#fcfcfd] overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-50/50 rounded-full blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* MATN QISMI */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-yellow-100">
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              {t("badge")}
            </div>

            <h2 className="text-5xl md:text-7xl font-[1000] text-slate-900 leading-[0.95] tracking-tighter mb-8">
              {t("title")} <br />
              <span className="text-[#58cc02]">{t("titleHighlight")}</span>
            </h2>

            <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 leading-relaxed max-w-lg">
              {t("desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <Link href="/dashboard">
                <button className="w-full sm:w-auto bg-[#58cc02] text-white font-black py-5 px-10 rounded-[2rem] text-sm uppercase tracking-widest border-b-[6px] border-[#3b8a01] active:border-b-0 active:translate-y-1 transition-all shadow-xl shadow-green-100">
                  {t("cta")}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* VIZUAL QISM */}
        <div className="w-full lg:w-1/2 flex justify-center relative order-1 lg:order-2 h-[450px]">
          <div className="relative w-full max-w-[400px] flex items-center justify-center">
            <motion.div
              initial={{ rotate: -5, y: 20 }}
              whileInView={{ rotate: -2, y: 0 }}
              className="absolute z-20 w-56 h-72 bg-gradient-to-br from-green-400 to-green-600 rounded-r-[2rem] rounded-l-md shadow-[20px_20px_60px_rgba(0,0,0,0.15)] border-l-[12px] border-green-700 flex flex-col p-6 text-white overflow-hidden group cursor-pointer"
            >
              <div className="h-1 w-full bg-white/20 rounded-full mb-4" />
              <div className="text-4xl font-black mb-auto italic">ABC</div>
              <div className="text-[100px] absolute -bottom-4 -right-4 opacity-20 rotate-12 group-hover:scale-110 transition-transform">📕</div>
              <div className="text-xs font-black uppercase tracking-widest opacity-60">Volume 01</div>
            </motion.div>

            <motion.div
              initial={{ x: 0, rotate: 0 }}
              whileInView={{ x: -60, rotate: -15 }}
              className="absolute z-10 w-48 h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-r-[1.5rem] rounded-l-md shadow-xl border-l-[10px] border-blue-700 p-4"
            >
              <div className="w-full h-full border border-white/10 rounded-r-xl" />
            </motion.div>

            <motion.div
              initial={{ x: 0, rotate: 0 }}
              whileInView={{ x: 60, rotate: 15, y: 30 }}
              className="absolute z-10 w-48 h-64 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-r-[1.5rem] rounded-l-md shadow-xl border-l-[10px] border-yellow-700 p-4"
            >
              <div className="w-full h-full border border-black/5 rounded-r-xl" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 right-10 bg-white p-4 rounded-3xl shadow-2xl z-30 border border-slate-50"
            >
              <span className="text-3xl">🌟</span>
            </motion.div>

            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-10 -left-10 bg-white px-5 py-3 rounded-2xl shadow-xl z-30 border border-slate-50 flex items-center gap-2"
            >
              <span className="text-xl">✏️</span>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{t("writing")}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
