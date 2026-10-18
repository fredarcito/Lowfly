"use client";

import { TicketsPlane } from "lucide-react";
import NavLink from "@/components/layout/NavLink";
import { useI18n } from "@/context/i18n";
import { useTripGroups } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const BUBBLE = "grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-bold text-primary-foreground tabular-nums ring-2 ring-background";

// "My trips" in the header navigation, with how many upcoming trips there are
const TripsLink = ({ active, className, iconClassName }) => {
  const { lang, texts } = useI18n();
  const upcoming = useTripGroups().upcoming.length;
  return (
    <NavLink
      href={ROUTES.trips(lang)}
      active={active}
      aria-label={upcoming ? `${texts.trips.title} (${upcoming})` : undefined}
      className={className}
    >
      {/* How many upcoming trips: a bubble on the icon, like a notification (it takes no room in the bar). Narrow
          phones show the tabs without icons (TopBar): the bubble then follows the name. */}
      <span className={cn("relative max-[449px]:hidden", upcoming > 0 && "mr-1.5")}>
        <TicketsPlane className={cn("size-4.5", iconClassName)} />
        {upcoming > 0 && <span className={cn(BUBBLE, "absolute -top-2 -right-2.5")}>{upcoming}</span>}
      </span>
      {texts.trips.title}
      {upcoming > 0 && <span className={cn(BUBBLE, "min-[450px]:hidden")}>{upcoming}</span>}
    </NavLink>
  );
};

export default TripsLink;
