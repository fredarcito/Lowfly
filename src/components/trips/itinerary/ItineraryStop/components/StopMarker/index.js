"use client";

import { Check, MapPin } from "lucide-react";
import { cn } from "@/utils/cn";

// The stop's marker: its map number (a tick once visited), a pin for places off the map, a dot otherwise
const StopMarker = ({ stop, open, visited }) => {
  if (stop.place && visited)
    return (
      <span className="grid size-9 place-items-center rounded-full bg-save text-white">
        <Check className="size-4.5" strokeWidth={3} />
      </span>
    );
  if (stop.number)
    return (
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground shadow-sm transition-shadow",
          open && "ring-4 ring-primary/30"
        )}
      >
        {stop.number}
      </span>
    );
  if (stop.place)
    return (
      <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
        <MapPin className="size-4" />
      </span>
    );
  return <span className="size-2.5 rounded-full bg-[color-mix(in_oklab,var(--muted-foreground)_55%,var(--card))] ring-4 ring-card" />;
};

export default StopMarker;
