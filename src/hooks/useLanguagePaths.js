"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/context/i18n";
import { folderOf, sectionIn } from "@/constants/sections";

// This same page in another language: the one the page gave (I18nProvider `paths`: a guide's own name in each
// language), or this address with the other language and its section named in it (/es/guias → /en/guides,
// constants/sections; /es/trips → /en/trips). Used as plain links (full reload), so the search starts fresh in
// that language.
export const useLanguagePaths = () => {
  const { paths } = useI18n();
  const [, , section, ...rest] = usePathname().split("/");
  return (locale) => {
    if (paths?.[locale]) return paths[locale];
    if (!section) return `/${locale}`;
    const folder = folderOf(section);
    return `/${[locale, folder ? sectionIn(locale, folder) : section, ...rest].join("/")}`;
  };
};
