"use client";

import { Plane } from "lucide-react";
import { useTripPhoto } from "@/hooks/useTripPhoto";
import { cn } from "@/utils/cn";

// The trip's photo (the destination's; a trip planned by hand, its first town's) over a sea-to-coral gradient,
// with a plane on it while the photo loads or when there is none (a plane while there is none). `children` sit on top.
const TripPhoto = ({ trip, className, children }) => {
  const photo = useTripPhoto(trip);
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]",
        className
      )}
    >
      {photo && <img src={photo.src} alt="" className="absolute inset-0 size-full object-cover" />}
      {/* The plane while the photo comes, or when there is none */}
      {!photo && <Plane className="absolute inset-0 m-auto size-10 -rotate-45 text-white/30" />}
      {children}
    </div>
  );
};

export default TripPhoto;
