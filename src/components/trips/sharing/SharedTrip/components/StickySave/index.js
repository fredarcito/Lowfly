"use client";

import SaveSharedTripButton from "@/components/trips/sharing/SaveSharedTripButton";

// Desktop, next to the stuck day tabs: where the trip goes and "Save to my trips", so it stays at hand while
// reading the plan
const StickySave = ({ trip }) => {
  const { fare } = trip;
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <p className="grid text-right leading-tight">
        <span className="font-heading text-sm font-bold">{fare.city}</span>
        <span className="text-xs text-muted-foreground">{fare.country}</span>
      </p>
      <SaveSharedTripButton trip={trip} className="h-9 px-4" />
    </div>
  );
};

export default StickySave;
