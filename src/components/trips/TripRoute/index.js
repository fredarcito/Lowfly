"use client";

import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { useAirportLabel } from "@/hooks/useAirports";
import { cn } from "@/utils/cn";

// "Malta (MLA) ⇆ Catania (CTA)", with a one-way arrow when there is no return
const TripRoute = ({ origin, fare, className }) => {
  const originLabel = useAirportLabel(origin);
  const RouteIcon = fare.ret ? ArrowLeftRight : ArrowRight;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-muted-foreground", className)}>
      <span>{originLabel}</span>
      <RouteIcon className="size-4 shrink-0" />
      <span>
        {fare.city} ({fare.code})
      </span>
    </p>
  );
};

export default TripRoute;
