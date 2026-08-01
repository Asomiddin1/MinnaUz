"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";
import { useTransition } from "react";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localeNames: Record<string, string> = {
  uz: "🇺🇿 O‘zbekcha",
  ru: "🇷🇺 Русский",
  jp: "🇯🇵 日本語",
  en: "🇬🇧 English",
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="h-9 gap-2 rounded-full border-slate-200 dark:border-slate-700 dark:bg-slate-800"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4 text-slate-500 dark:text-slate-200" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            {locale}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="z-[100] w-44">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleChange(loc)}
            className="flex cursor-pointer items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              {localeNames[loc] ?? loc.toUpperCase()}
            </span>
            {locale === loc && <Check className="h-4 w-4 text-blue-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
