"use client";

import { Plane } from "lucide-react";
import { usePhoto } from "@/hooks/usePhoto";
import { cn } from "@/utils/cn";

// Destination photo over a sea-to-coral gradient (a plane while there is none). `children` sit on top.
export default function TripPhoto({ code, className, children }) {
  const photo = usePhoto(code);
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]",
        className
      )}
    >
      {photo && <img src={photo.src} alt="" className="absolute inset-0 size-full object-cover" />}
      {photo === null && <Plane className="absolute inset-0 m-auto size-10 -rotate-45 text-white/30" />}
      {children}
    </div>
  );
}
