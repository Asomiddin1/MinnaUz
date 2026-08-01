"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export default function HeroSection() {
  const t = useTranslations("Herotap");
  const dotColor = "#b9d6e9";

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#f8f8f8] flex flex-col items-center pt-20 md:pt-28 pb-16 md:pb-20">
      {/* PREMIUM NUQTALI FON */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(${dotColor} 3px, transparent 3px)`,
          backgroundSize: "45px 45px",
          opacity: 0.6,
        }}
      ></div>

      {/* Sarlavha va Tugma */}
      <div className="relative z-50 flex flex-col items-center text-center px-4 sm:px-6 mb-8 md:mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-[72px] font-[1000] text-[#042c60] leading-[1.1] md:leading-none tracking-tighter mb-6 md:mb-8"
        >
          {t("title")}
        </motion.h1>

        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#ffffff] text-[#042c60] font-black text-base sm:text-lg md:text-xl uppercase py-3.5 px-10 sm:py-4 sm:px-16 rounded-xl sm:rounded-2xl border-b-[4px] sm:border-b-[6px] border-[#1342a0] shadow-lg md:shadow-xl hover:shadow-[0_15px_30px_rgba(28,176,246,0.3)] transition-all"
          >
            {t("cta")}
          </motion.button>
        </Link>
      </div>

      {/* Markaziy Kompozitsiya */}
      <div
        className="relative w-full max-w-5xl h-[350px] sm:h-[450px] md:h-[500px] flex justify-center items-end"
        style={{ perspective: "1500px" }}
      >
        <motion.div
          initial={{ opacity: 0, rotateX: 45, y: 150 }}
          animate={{ opacity: 1, rotateX: 30, y: 50 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
          className="relative z-40 w-[240px] h-[450px] sm:w-[290px] sm:h-[550px] md:w-[340px] md:h-[620px] bg-white border-[8px] sm:border-[12px] text-[#042c60] rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] md:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.15)] flex flex-col items-center overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute top-3 md:top-4 w-20 md:w-28 h-5 md:h-7 bg-[#1c4d91] rounded-full z-50 opacity-20"></div>

          <div className="w-full h-full bg-gradient-to-b from-[#f0f9ff] to-white relative flex items-end justify-center overflow-hidden">
            <div className="relative w-full h-[85%] flex items-end justify-center px-4">
              <motion.div
                initial={{ y: 250, opacity: 0, scale: 0.7 }}
                animate={{ y: [0, -10, 0], opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
                className="w-[110%] h-auto object-contain z-20 select-none drop-shadow-2xl mb-2 sm:mb-4"
              />

              {/* Sparkles */}
              <div className="absolute top-6 sm:top-10 flex space-x-8 sm:space-x-12 text-2xl items-center h-full sm:text-3xl z-30 pointer-events-none">
                <h1 className="text-[#042c60] font-black text-center">Minna.Uz</h1>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  ✨
                </motion.span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/10 pointer-events-none z-40" />
        </motion.div>
      </div>

      {/* MOVIY TO'LQIN */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none translate-y-[1px]">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="block w-full h-[120px] sm:h-[200px] md:h-[400px] fill-[#380dd1]">
          <path d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,229.3C1120,235,1280,213,1360,202.7L1440,192V320H1360C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320H0V224Z"></path>
        </svg>
      </div>

      <div className="absolute bottom-0 w-full h-[20px] sm:h-[40px] md:h-[80px] bg-[#380dd1] z-30" />
    </section>
  );
}
