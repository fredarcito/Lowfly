"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { useLanguagePaths } from "@/hooks/useLanguagePaths";
import { LOCALES } from "@/i18n/config";
import { cn } from "@/utils/cn";

// Plain links (full reload) so the search starts fresh in the other language
const LanguageSwitch = ({ className }) => {
  const { lang, texts } = useI18n();
  const pathIn = useLanguagePaths();
  return (
    <nav
      aria-label={texts.header.language}
      className={cn("flex shrink-0 items-center gap-1 rounded-full bg-hero-glass p-1 text-xs font-semibold ring-1 ring-hero-glass-edge backdrop-blur-md", className)}
    >
      <Languages className="mx-1 size-3.5 text-hero-muted max-sm:hidden" aria-hidden />
      {LOCALES.map((locale) => (
        <a
          key={locale}
          href={pathIn(locale)}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === lang ? "page" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            locale === lang ? "bg-hero-chip-active text-hero-chip-active-foreground shadow-sm" : "text-hero-muted hover:text-hero-foreground"
          )}
        >
          {locale}
        </a>
      ))}
    </nav>
  );
};

export default LanguageSwitch;
