"use client";

import { useMemo } from "react";
import { I18nContext } from "@/context/i18n";
import { getDictionary } from "@/i18n";
import { createFormat } from "@/utils/format";

// Gives every component the language, its dictionary (texts) and the formatting functions (format). `paths`: this
// page in each language ({ es, en }), for a page whose address is not the same but for the language (a guide's:
// /es/guias/roma-3-dias, /en/guides/rome-3-days); the language switch goes there (hooks/useLanguagePaths).
export const I18nProvider = ({ lang, paths = null, children }) => {
  const value = useMemo(() => {
    const dictionary = getDictionary(lang);
    return { lang, paths, texts: dictionary, format: createFormat(lang, dictionary) };
  }, [lang, paths]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
