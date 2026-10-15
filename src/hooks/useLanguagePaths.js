"use client";

import { usePathname } from "next/navigation";

// This same page in another language: /es/trips → /en/trips. Used as plain links (full reload), so the search
// starts fresh in that language.
export const useLanguagePaths = () => {
  const rest = usePathname().replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return (locale) => `/${locale}${rest}`;
};
