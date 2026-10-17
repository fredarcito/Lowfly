"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { APP_NAME } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";

// The airports' pages linked from every page (they lead search engines to every route): [{ slug, city }]
const ORIGIN_LINKS = [{ slug: "malta", city: "Malta" }];

// The foot of every page: the logo and what Lowfly is, the airports' pages and the legal pages (only pages that
// exist: no empty "About" or social profiles)
const SiteFooter = () => {
  const { lang, texts } = useI18n();
  return (
    <footer className="mx-auto mt-4 flex w-full max-w-[calc(64rem+3rem)] flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t px-4 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] text-sm sm:px-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.home(lang)} className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="size-3.5 -rotate-45" />
          </span>
          {APP_NAME}
        </Link>
        <span className="text-muted-foreground max-sm:hidden">{texts.header.kicker}</span>
      </div>
      <nav aria-label={texts.footer.label} className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground">
        {ORIGIN_LINKS.map((origin) => (
          <Link key={origin.slug} href={ROUTES.flightRoute(lang, origin.slug)} className="hover:text-foreground">
            {texts.footer.flightsFrom(origin.city)}
          </Link>
        ))}
        <Link href={ROUTES.privacy(lang)} className="hover:text-foreground">
          {texts.account.privacy}
        </Link>
        <Link href={ROUTES.terms(lang)} className="hover:text-foreground">
          {texts.account.terms}
        </Link>
      </nav>
    </footer>
  );
};

export default SiteFooter;
