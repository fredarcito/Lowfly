"use client";

import { usePathname } from "next/navigation";
import { Compass, Plane } from "lucide-react";
import { AccountButton } from "@/components/layout/AccountButton";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import SettingsMenu from "@/components/layout/SettingsMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import NavLink from "@/components/layout/NavLink";
import TripsLink from "@/components/layout/TripsLink";
import { useI18n } from "@/context/i18n";
import { APP_NAME } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Logo, the navigation (Explore · My trips), theme, language and the account. Sits on the header colours (--hero-*).
const TopBar = ({ className }) => {
  const { lang, texts } = useI18n();
  // Each tab marks its own pages; elsewhere (a shared trip, sign in, legal pages) neither is marked
  const pathname = usePathname();
  const onTrips = pathname.startsWith(ROUTES.trips(lang));
  const onExplore = pathname === ROUTES.home(lang);
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-4 max-[400px]:gap-3 max-[340px]:gap-2.5 sm:gap-8">
        <a href={ROUTES.home(lang)} className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground max-[340px]:size-7">
            <Plane className="size-4 -rotate-45" />
          </span>
          {/* Small phones: the coral logo alone (the name stays for screen readers), so the bar fits */}
          <span className="max-[480px]:sr-only">{APP_NAME}</span>
        </a>
        <nav aria-label={texts.header.nav} className="flex items-center gap-4 max-[400px]:gap-3 max-[340px]:gap-2.5 sm:gap-6">
          {/* Always there, also on phones: the way back to searching */}
          <NavLink href={ROUTES.home(lang)} active={onExplore}>
            {/* Narrow phones: just the name, so both fit */}
            <Compass className="size-4.5 max-[400px]:hidden" />
            {texts.header.explore}
          </NavLink>
          <span aria-hidden className="h-5 w-px bg-hero-chip max-md:hidden" />
          <TripsLink active={onTrips} />
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2 max-[340px]:gap-1.5 sm:gap-3">
        {/* Phones and small tablets: theme and language in one menu, so the navigation keeps its names */}
        <SettingsMenu className="md:hidden" />
        <ThemeToggle className="max-md:hidden" />
        <span aria-hidden className="h-5 w-px bg-hero-chip max-md:hidden" />
        <LanguageSwitch className="max-md:hidden" />
        <AccountButton />
      </div>
    </div>
  );
};

export default TopBar;
