"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { LOCALES } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

// Plain links (full reload) so the search starts fresh in the other language
export default function LanguageSwitch() {
  const { lang, t } = useI18n();
  return (
    <nav aria-label={t.header.language} className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 p-1 text-xs font-semibold">
      <Languages className="mx-1 size-3.5 text-white/60" aria-hidden />
      {LOCALES.map((l) => (
        <a
          key={l}
          href={`/${l}`}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "page" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            l === lang ? "bg-white text-[#10202e]" : "text-white/70 hover:text-white"
          )}
        >
          {l}
        </a>
      ))}
    </nav>
  );
}
