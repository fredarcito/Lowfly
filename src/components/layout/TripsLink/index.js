"use client";

import Link from "next/link";
import { TicketsPlane } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { useTripGroups } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// A link in the header navigation, underlined when it is the current page
export const NavLink = ({ href, active, className, children, ...props }) => {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2 rounded-md py-1.5 font-heading text-[0.95rem] font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        "after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity",
        active ? "text-hero-foreground after:opacity-100" : "text-hero-muted after:opacity-0 hover:text-hero-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

// "My trips" in the header navigation, with how many upcoming trips there are
const TripsLink = ({ active, className }) => {
  const { lang, t } = useI18n();
  const upcoming = useTripGroups().upcoming.length;
  return (
    <NavLink
      href={ROUTES.trips(lang)}
      active={active}
      aria-label={upcoming ? `${t.trips.title} (${upcoming})` : undefined}
      className={className}
    >
      <TicketsPlane className="size-4.5" />
      {t.trips.title}
      {upcoming > 0 && (
        <span className="-mt-3 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4.5 font-bold text-primary-foreground tabular-nums">
          {upcoming}
        </span>
      )}
    </NavLink>
  );
};

export default TripsLink;
