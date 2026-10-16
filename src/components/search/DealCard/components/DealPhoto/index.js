"use client";

import PhotoCredit from "@/components/shared/PhotoCredit";
import SaveTripButton from "@/components/search/SaveTripButton";
import { useI18n } from "@/context/i18n";
import { usePhoto } from "@/hooks/usePhoto";
import { fallbackPhoto } from "@/utils/fallbackPhoto";
import { noTimeOff } from "@/utils/weekend";

// The top of a deal: the destination's photo with its credit (a generic travel photo when it has none; the
// gradient, pulsing, while it loads), "Save trip" and, when it needs no time off work, a badge saying so
const DealPhoto = ({ fare, origin }) => {
  const { texts } = useI18n();
  const photo = usePhoto(fare.code);
  const image = photo ?? fallbackPhoto(fare.code);
  return (
    <div className="relative aspect-16/10 overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]">
      {photo === undefined ? (
        <div className="absolute inset-0 animate-pulse bg-white/10 motion-reduce:animate-none" />
      ) : (
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(min-width: 768px) 400px, 100vw"
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
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
