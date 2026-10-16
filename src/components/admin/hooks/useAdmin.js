"use client";

import { useI18n } from "@/context/i18n";
import { adminTexts } from "@/components/admin/data/texts";
import { adminFormat } from "@/components/admin/data/format";

// The admin's words and formats in the page's language, for its client components (server ones take `lang`)
export const useAdmin = () => {
  const { lang } = useI18n();
  return { lang, texts: adminTexts(lang), format: adminFormat(lang) };
};
