"use client";

import { Plane } from "lucide-react";
import PhotoCredit from "@/components/shared/PhotoCredit";
import SaveTripButton from "@/components/search/SaveTripButton";
import { useI18n } from "@/context/i18n";
import { usePhoto } from "@/hooks/usePhoto";
import { noTimeOff } from "@/utils/weekend";

// The top of a deal: the destination's photo (a plane without one) with its credit, "Save trip" and, when it
// needs no time off work, a badge saying so
const DealPhoto = ({ fare, origin }) => {
  const { texts } = useI18n();
  const photo = usePhoto(fare.code);
  return (
    <div className="relative aspect-16/10 overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]">
      {photo ? (
        <img
          src={photo.src}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        photo === null && <Plane className="absolute inset-0 m-auto size-10 -rotate-45 text-white/30" />
      )}
      {photo && <PhotoCredit page={photo.page} text={texts.deals.photoBy(photo.author, photo.license)} className="right-2 bottom-2" />}
      <SaveTripButton origin={origin} fare={fare} compact className="absolute top-2 right-2 z-10" />
      {noTimeOff(fare) && (
        <span title={texts.results.noTimeOffHint} className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {texts.results.noTimeOff}
        </span>
      )}
    </div>
  );
};

export default DealPhoto;
