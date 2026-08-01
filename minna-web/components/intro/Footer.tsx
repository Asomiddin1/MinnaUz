"use client";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="relative w-full bg-[#f4f7f9] pt-20 overflow-hidden flex flex-col font-sans">
      {/* 4 Ustunli Menyu */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-6 mb-32">
        {/* 1-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">
            {t("info")}
          </h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("aboutMinna")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("mission")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("terms")}</li>
          </ul>
        </div>

        {/* 2-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">
            {t("learn")}
          </h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("courses")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("effectiveness")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("publicOffer")}</li>
          </ul>
        </div>

        {/* 3-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">
            {t("products")}
          </h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("minnaUz")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("forSchools")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("forDevelopers")}</li>
          </ul>
        </div>

        {/* 4-ustun */}
        <div>
          <h3 className="font-bold text-black mb-6 uppercase tracking-wider text-[15px]">
            {t("help")}
          </h3>
          <ul className="space-y-4 text-[16px] text-gray-800 font-medium">
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("supportCenter")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("privacy")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("account")}</li>
            <li className="hover:text-black hover:underline cursor-pointer transition-all">{t("payments")}</li>
          </ul>
        </div>
      </div>

      {/* Pastki qism */}
      <div className="relative w-full flex justify-center items-end h-32 md:h-48 mt-10">
        <h1 className="absolute bottom-0 z-0 text-[25vw] font-black text-[#083257]/40 leading-none tracking-tighter uppercase select-none translate-y-[30%] text-center w-full whitespace-nowrap pointer-events-none">
          MINNA
        </h1>

        <div className="absolute bottom-6 md:bottom-10 z-20 text-center w-full px-4">
          <p className="text-white text-[14px] md:text-[16px] font-medium bg-black inline-flex flex-wrap justify-center items-center gap-3 py-3 px-5 rounded-xl shadow-lg">
            <span>{t("copyright")}</span>
            <span className="font-light text-gray-400">|</span>
            <span className="hover:underline cursor-pointer">{t("privacyTerms")}</span>
            <span className="font-light text-gray-400">|</span>
            <span>{t("language")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
