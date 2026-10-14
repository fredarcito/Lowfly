"use client";

import { useMemo } from "react";
import { I18nContext } from "@/context/i18n";
import { getDictionary } from "@/i18n";
import { createFormat } from "@/utils/format";

// Gives every component the language, its dictionary (t) and the formatting functions (f)
export function I18nProvider({ lang, children }) {
  const value = useMemo(() => {
    const dictionary = getDictionary(lang);
    return { lang, t: dictionary, f: createFormat(lang, dictionary) };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
