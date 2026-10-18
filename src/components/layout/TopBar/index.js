"use client";

import { usePathname } from "next/navigation";
import { Compass, Landmark, Plane, Sparkles } from "lucide-react";
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

// Narrow phones: the tabs' names alone, so the four fit in a row
const NAV_ICON = "size-4.5 max-[449px]:hidden";

// Logo, the navigation (Explore · Create itinerary · Guides · My trips), theme, language and the account. Sits on the header
// colours (--hero-*). Desktop: all in one row. Phones and tablets: the logo and the buttons on top, the
// navigation below across the whole width.
const TopBar = ({ className }) => {
  const { lang, texts } = useI18n();
  // Each tab marks its own pages; elsewhere (a shared trip, sign in, legal pages) none is marked
  const pathname = usePathname();
  const onNewTrip = pathname.startsWith(ROUTES.newTrip(lang));
  const onTrips = pathname.startsWith(ROUTES.trips(lang)) && !onNewTrip;
  const onExplore = pathname === ROUTES.home(lang);
  const onGuides = pathname.startsWith(ROUTES.guides(lang));
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-x-3 gap-y-4", className)}>
      <a href={ROUTES.home(lang)} className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground max-[340px]:size-7">
          <Plane className="size-4 -rotate-45" />
        </span>
        {APP_NAME}
      </a>
      <nav
        aria-label={texts.header.nav}
        className="flex items-center justify-between gap-2 max-lg:order-last max-lg:w-full max-lg:sm:justify-start max-lg:sm:gap-10 lg:mr-auto lg:ml-8 lg:gap-7 xl:ml-10"
      >
        {/* Always there, also on phones: the way back to searching */}
        <NavLink href={ROUTES.home(lang)} active={onExplore}>
          <Compass className={NAV_ICON} />
          {texts.header.explore}
        </NavLink>
        <NavLink href={ROUTES.newTrip(lang)} active={onNewTrip}>
          <Sparkles className={NAV_ICON} />
          {texts.trips.createItinerary}
        </NavLink>
        <NavLink href={ROUTES.guides(lang)} active={onGuides}>
          <Landmark className={NAV_ICON} />
          {texts.header.guides}
        </NavLink>
        <TripsLink active={onTrips} iconClassName={NAV_ICON} />
      </nav>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Phones and small tablets: theme and language in one menu, so the top row keeps the logo's name */}
        <SettingsMenu className="md:hidden" />
        <ThemeToggle className="max-md:hidden" />
        <LanguageSwitch className="max-md:hidden" />
        <AccountButton />
      </div>
    </div>
  );
};

export default TopBar;
