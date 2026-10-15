"use client";

import { usePathname } from "next/navigation";
import { Plane } from "lucide-react";
import { AccountButton } from "@/components/layout/AccountButton";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import ThemeToggle from "@/components/layout/ThemeToggle";
import TripsLink, { NavLink } from "@/components/layout/TripsLink";
import { useI18n } from "@/context/i18n";
import { APP_NAME } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Logo, the navigation (Explore · My trips), theme, language and the account. Sits on the header colours (--hero-*).
const TopBar = ({ className }) => {
  const { lang, t } = useI18n();
  const onTrips = usePathname().startsWith(ROUTES.trips(lang));
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-4 sm:gap-8">
        <a href={ROUTES.home(lang)} className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="size-4 -rotate-45" />
          </span>
          <span className="max-[400px]:sr-only">{APP_NAME}</span>
        </a>
        <nav aria-label={t.header.nav} className="flex items-center gap-4 sm:gap-6">
          <NavLink href={ROUTES.home(lang)} active={!onTrips} className="max-sm:hidden">
            {t.header.explore}
          </NavLink>
          <span aria-hidden className="h-5 w-px bg-hero-chip max-sm:hidden" />
          <TripsLink active={onTrips} />
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <span aria-hidden className="h-5 w-px bg-hero-chip max-sm:hidden" />
        <LanguageSwitch />
        <AccountButton />
      </div>
    </div>
  );
};

export default TopBar;
