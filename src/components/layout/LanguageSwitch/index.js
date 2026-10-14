"use client";

import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { LOCALES } from "@/i18n/config";
import { cn } from "@/utils/cn";

// Plain links (full reload) so the search starts fresh in the other language
export default function LanguageSwitch() {
  const { lang, t } = useI18n();
  // Same page in the other language (/es/trips → /en/trips)
  const rest = usePathname().replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return (
    <nav aria-label={t.header.language} className="flex shrink-0 items-center gap-1 rounded-full bg-hero-chip p-1 text-xs font-semibold">
      <Languages className="mx-1 size-3.5 text-hero-muted max-sm:hidden" aria-hidden />
      {LOCALES.map((l) => (
        <a
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "page" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            l === lang ? "bg-hero-chip-active text-hero-chip-active-foreground shadow-sm" : "text-hero-muted hover:text-hero-foreground"
          )}
        >
          {l}
        </a>
      ))}
    </nav>
  );
}
