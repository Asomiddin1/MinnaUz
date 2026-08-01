"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function LanguageStrip() {
  const t = useTranslations("LanguageStrip");

  const features = [
    {
      name: t("japanese"),
      desc: t("japaneseDesc"),
      gradient: "from-rose-500 to-red-600",
      shadow: "shadow-[0_10px_20px_-5px_rgba(225,29,72,0.4)] md:shadow-[0_15px_30px_-5px_rgba(225,29,72,0.4)]",
      bgHover: "group-hover:bg-rose-50",
      icon: (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-4 w-10 h-10 bg-white/20 rounded-full blur-sm" />
          <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.9)] z-10" />
          <div className="w-16 h-2 bg-white/80 rounded-full mt-2 z-20" />
          <div className="flex gap-6 -mt-1 z-10">
            <div className="w-2 h-6 bg-white/80 rounded-sm" />
            <div className="w-2 h-6 bg-white/80 rounded-sm" />
          </div>
        </div>
      ),
    },
    {
      name: t("tests"),
      desc: t("testsDesc"),
      gradient: "from-emerald-400 to-teal-500",
      shadow: "shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] md:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)]",
      bgHover: "group-hover:bg-emerald-50",
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="w-12 h-16 bg-white rounded-md shadow-lg flex flex-col items-center justify-center p-2 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
            <span className="text-teal-500 font-black text-2xl leading-none">A+</span>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-2" />
            <div className="w-2/3 h-1 bg-gray-100 rounded-full mt-1.5" />
          </div>
        </div>
      ),
    },
    {
      name: t("videos"),
      desc: t("videosDesc"),
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-[0_10px_20px_-5px_rgba(139,92,246,0.4)] md:shadow-[0_15px_30px_-5px_rgba(139,92,246,0.4)]",
      bgHover: "group-hover:bg-violet-50",
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="w-16 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-violet-600 border-b-[8px] border-b-transparent ml-1" />
          </div>
        </div>
      ),
    },
    {
      name: t("games"),
      desc: t("gamesDesc"),
      gradient: "from-cyan-400 to-blue-500",
      shadow: "shadow-[0_10px_20px_-5px_rgba(6,182,212,0.4)] md:shadow-[0_15px_30px_-5px_rgba(6,182,212,0.4)]",
      bgHover: "group-hover:bg-cyan-50",
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="w-16 h-10 bg-white rounded-full shadow-lg flex items-center justify-between px-3 group-hover:rotate-[5deg] group-hover:scale-110 transition-transform duration-500">
            <div className="w-4 h-4 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
              <div className="w-2 h-2 bg-cyan-400 rounded-sm" />
            </div>
            <div className="flex gap-1 rotate-45">
              <div className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_5px_#ec4899]" />
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6] mt-1.5" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-slate-50 py-12 md:py-20 overflow-hidden relative border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8 }}
              className="group flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.08)] md:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer overflow-hidden relative"
            >
              <div className={`absolute inset-0 ${item.bgHover} opacity-0 group-hover:opacity-100 transition-colors duration-500 -z-10`} />
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br ${item.gradient} ${item.shadow} flex items-center justify-center mb-4 md:mb-8 relative z-10 transition-all duration-500 group-hover:shadow-2xl`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl md:rounded-3xl" />
                <div className="transform scale-[0.65] md:scale-100 w-full h-full flex items-center justify-center absolute inset-0">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-slate-800 mb-1 md:mb-2 transition-colors duration-300 leading-tight">
                {item.name}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-400 leading-tight md:leading-normal">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
