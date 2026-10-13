"use client";

import { createContext, useContext, useMemo } from "react";
import { getDictionary } from "@/lib/i18n";
import { createFormat } from "@/lib/format";

const I18nContext = createContext(null);

// Gives every component the language, its dictionary (t) and the formatting functions (f)
export function I18nProvider({ lang, children }) {
  const value = useMemo(() => {
    const t = getDictionary(lang);
    return { lang, t, f: createFormat(lang, t) };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
