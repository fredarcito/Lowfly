"use client";

import SaveSharedTripButton from "@/components/trips/sharing/SaveSharedTripButton";

// Desktop, next to the stuck day tabs: where the trip goes and "Save to my trips", so it stays at hand while
// reading the plan
const StickySave = ({ trip }) => {
  const { fare } = trip;
  return (
    <div className="flex min-w-0 items-center gap-3 whitespace-nowrap">
      {/* A long route ("Roma → Nápoles → Venecia → Milán") is cut at its end with "…", whole on hover */}
      <p title={fare.city} className="grid min-w-0 text-right leading-tight">
        <span className="truncate font-heading text-sm font-bold">{fare.city}</span>
        <span className="truncate text-xs text-muted-foreground">{fare.country}</span>
      </p>
      <SaveSharedTripButton trip={trip} className="h-9 px-4" />
    </div>
  );
};

export default StickySave;
