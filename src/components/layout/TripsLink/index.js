"use client";

import { TicketsPlane } from "lucide-react";
import NavLink from "@/components/layout/NavLink";
import { useI18n } from "@/context/i18n";
import { useTripGroups } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";

// "My trips" in the header navigation, with how many upcoming trips there are
const TripsLink = ({ active, className }) => {
  const { lang, texts } = useI18n();
  const upcoming = useTripGroups().upcoming.length;
  return (
    <NavLink
      href={ROUTES.trips(lang)}
      active={active}
      aria-label={upcoming ? `${texts.trips.title} (${upcoming})` : undefined}
      className={className}
    >
      <TicketsPlane className="size-4.5" />
      {/* On the narrowest phones only the icon, like the logo (the name stays for screen readers) */}
      <span className="max-[380px]:sr-only">{texts.trips.title}</span>
      {upcoming > 0 && (
        <span className="-mt-3 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4.5 font-bold text-primary-foreground tabular-nums">
          {upcoming}
        </span>
      )}
    </NavLink>
  );
};

export default TripsLink;
