"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";

interface HeroProps {
  isBottom?: boolean;
}

export default function Hero({ isBottom = false }: HeroProps) {
  const t = useTranslations("Hero");

  return (
    <section
      className={`relative flex w-full flex-col items-center overflow-hidden bg-[#eaf6ff] ${isBottom ? "pt-24 pb-0" : "min-h-[85vh] pt-42 pb-20"}`}
    >
      {/* Nuqtali orqa fon */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 2px, transparent 2px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="z-20 flex w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 md:flex-row md:gap-20">
        <div className="h-64 w-64 md:h-[400px] md:w-[400px]">
          <Image
            src="/images/minna.png"
            alt="MINNA logo"
            width={400}
            height={400}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Matn va tugmalar */}
        <motion.div
          className="order-1 flex w-full flex-col items-center text-center md:order-2 md:w-1/2 md:items-start md:text-left"
          initial={{ opacity: 0, x: isBottom ? 0 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-10 text-4xl leading-tight font-black text-[#042c60] md:text-5xl lg:text-[4rem]">
            {t("title")}
          </h1>

          <div className="flex w-full max-w-[320px] flex-col gap-4">
            <Link href="/dashboard">
              <button className="w-full rounded-2xl border-b-4 border-[#03206a] py-4 text-[17px] font-black text-[#0549b0] text-[#1259fe] uppercase shadow-sm transition-all hover:bg-gray-100 active:translate-y-1 active:border-b-3">
                {t("getStarted")}
              </button>
            </Link>

            {!isBottom && (
              <Link href="/auth/login">
                <button className="w-full rounded-2xl border-2 border-b-4 border-gray-200 bg-white py-4 text-[17px] font-black text-[#1cb0f6] uppercase shadow-sm transition-all hover:bg-gray-100 active:translate-y-[2px] active:border-b-2">
                  {t("haveAccount")}
                </button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Wave */}
      {!isBottom && (
        <div className="absolute bottom-0 left-0 z-10 w-full translate-y-[1px] leading-[0]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block h-[120px] w-full fill-[#042c60]"
          >
            <path d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      )}
    </section>
  );
}
