"use client";

import { tripPhotoKey, useTripPhoto } from "@/hooks/useTripPhoto";
import { cn } from "@/utils/cn";
import { fallbackPhoto } from "@/utils/fallbackPhoto";

// The trip's photo (the destination's; a trip planned by hand, its first town's), or a generic travel photo when
// it has none; while it loads, a sea-to-coral gradient that pulses. `children` sit on top.
const TripPhoto = ({ trip, className, children }) => {
  const photo = useTripPhoto(trip);
  const image = photo ?? fallbackPhoto(tripPhotoKey(trip));
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]",
        className
      )}
    >
      {photo === undefined ? (
        <div className="absolute inset-0 animate-pulse bg-white/10 motion-reduce:animate-none" />
      ) : (
        <img src={image.src} srcSet={image.srcSet} sizes="(min-width: 768px) 320px, 100vw" alt="" className="absolute inset-0 size-full object-cover" />
      )}
      {children}
    </div>
  );
};

export default TripPhoto;
