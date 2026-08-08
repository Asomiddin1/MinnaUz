"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";
import { useTransition, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localeNames: Record<string, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  jp: "日本語",
  en: "English",
};

const flags: Record<string, string> = {
  uz: "🇺🇿",
  ru: "🇷🇺",
  jp: "🇯🇵",
  en: "🇬🇧",
};

const flagText: Record<string, string> = {
  uz: "UZ",
  ru: "RU",
  jp: "JP",
  en: "EN",
};

// Flag SVG'lari
const FlagIcon = ({ code }: { code: string }) => {
  const [mounted, setMounted] = useState(false);
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsWindows(typeof window !== 'undefined' && navigator.userAgent.includes('Windows'));
  }, []);

  // Server-side va birinchi renderda text kodni ko'rsatamiz
  if (!mounted) {
    return (
      <span className="text-[11px] font-bold tracking-wider opacity-70">
        {flagText[code] || code.toUpperCase()}
      </span>
    );
  }
  
  return (
    <span className="text-[11px] font-bold tracking-wider opacity-70">
      {isWindows ? flagText[code] : flags[code]}
    </span>
  );
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(newLocale: string) {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  // Apple primary blue rangi
  const appleBlue = "#007AFF";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          aria-label="Switch language"
          aria-haspopup="listbox"
          className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-medium text-foreground transition-colors duration-300 hover:bg-secondary"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-[13px] w-[13px] opacity-60"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.3}
          >
            <circle cx="8" cy="8" r="6.2" />
            <ellipse cx="8" cy="8" rx="2.6" ry="6.2" />
            <path d="M2 6h12M2 10h12" />
          </svg>
          <FlagIcon code={locale} />
          {localeNames[locale] ?? locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="z-[100] w-44 overflow-hidden rounded-[16px] border border-border bg-glass p-1 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      >
        {routing.locales.map((loc) => {
          const isSelected = locale === loc;

          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleChange(loc)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-[12px] px-3 py-2 text-left text-[14px] transition-colors duration-200 ${
                isSelected
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="flex items-center gap-2">
                <FlagIcon code={loc} />
                {localeNames[loc] ?? loc.toUpperCase()}
              </span>
              {isSelected && (
                <Check 
                  className="h-4 w-4" 
                  style={{ color: appleBlue }}
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}