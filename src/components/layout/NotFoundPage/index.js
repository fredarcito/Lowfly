"use client";

import { usePathname } from "next/navigation";
import TripsPage from "@/components/trips/TripsPage";
import NotFoundHero from "@/components/layout/NotFoundPage/components/NotFoundHero";
import { I18nProvider } from "@/providers/I18nProvider";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";

// A page that does not exist, in the app's frame: over a travel photo, the 404 told kindly and the ways back
// (search flights, my trips), then the footer. Its language comes from the address (/es/… or /en/…): "not found"
// pages get no params.
const NotFoundPage = () => {
  const first = usePathname()?.split("/")[1];
  return (
    <I18nProvider lang={hasLocale(first) ? first : DEFAULT_LOCALE}>
      <TripsPage hero={<NotFoundHero />} />
    </I18nProvider>
  );
};

export default NotFoundPage;
