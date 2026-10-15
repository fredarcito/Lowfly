"use client";

import { TicketsPlane } from "lucide-react";
import NavLink from "@/components/layout/NavLink";
import { useI18n } from "@/context/i18n";
import { useTripGroups } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

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
      {/* How many upcoming trips: a bubble on the icon, like a notification (it takes no room in the bar) */}
      <span className={cn("relative", upcoming > 0 && "mr-1.5")}>
        <TicketsPlane className="size-4.5" />
        {upcoming > 0 && (
          <span className="absolute -top-2 -right-2.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-bold text-primary-foreground tabular-nums ring-2 ring-background duration-300 animate-in zoom-in-50 motion-reduce:animate-none">
            {upcoming}
          </span>
        )}
      </span>
      {texts.trips.title}
    </NavLink>
  );
};

export default TripsLink;
