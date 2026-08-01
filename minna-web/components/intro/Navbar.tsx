"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Navbar");

  const navLinks = [
    { name: t("about"), href: "#about" },
    { name: t("results"), href: "#results" },
    { name: t("premium"), href: "#premium" },
    { name: t("contact"), href: "#contact" },
  ];

  return (
    <nav className="w-full fixed top-4 md:top-6 z-[50] flex justify-center px-4">
      <div className="max-w-7xl w-full bg-white/80 backdrop-blur-xl h-16 md:h-20 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/40 flex items-center justify-between px-6 md:px-10 relative z-[1001]">
        
        {/* LOGO */}
        <a href="#" className="flex items-center cursor-pointer group">
          <h2 className="text-[#042c60] text-xl md:text-2xl font-[1000] tracking-tighter flex items-center gap-1">
            Minna<span className="text-[#58cc02]">.</span>Uz
          </h2>
        </a>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[#042c60] font-black text-[13px] uppercase tracking-wider hover:text-[#161cc4] transition-colors duration-300 relative group"
            >
              {link.name}
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-[#04238b] transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <Link href="/dashboard">
            <button className="hidden sm:block bg-[#1454d2] text-white font-[1000] text-[12px] uppercase py-3 px-8 rounded-full border-b-[4px] border-[#164ea0] active:border-b-0 active:translate-y-1 transition-all shadow-lg shadow-blue-500/20">
              {t("login")}
            </button>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-slate-50 rounded-full border border-slate-100 relative z-[1002]"
          >
            <motion.span 
              animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-[#042c60] rounded-full"
            />
            <motion.span 
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-[#042c60] rounded-full"
            />
            <motion.span 
              animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-[#042c60] rounded-full"
            />
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-[998]"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-20 left-4 right-4 bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 lg:hidden z-[999] flex flex-col gap-6 items-center"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[#042c60] font-[1000] text-lg uppercase tracking-tighter hover:text-[#1a48c6] transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <hr className="w-full border-slate-50" />
              <Link href="/dashboard" className="w-full">
                <button className="w-full bg-[#1745de] text-white font-[1000] py-4 rounded-3xl border-b-[6px] border-[#0f37ba] active:border-b-0 active:translate-y-1 transition-all">
                  {t("start")}
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
