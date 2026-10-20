"use client";

import { CalendarDays, Snowflake, Sparkles } from "lucide-react";
import PhotoCredit from "@/components/shared/PhotoCredit";
import { useI18n } from "@/context/i18n";
import { usePhoto } from "@/hooks/usePhoto";
import { fallbackPhoto } from "@/utils/fallbackPhoto";
import { tripDays } from "@/utils/multiCity";

// The top of a route's card (its side on wide screens): the photo of the city you land in, with its credit (a
// generic travel photo when it has none; the gradient, pulsing, while it loads), and on it what kind of route it is
// (a surprise, a seasonal one) and how many days
const RoutePhoto = ({ route, trip }) => {
  const { texts } = useI18n();
  const labels = texts.multiCity;
  const photo = usePhoto(trip.code);
  const image = photo ?? fallbackPhoto(trip.code);
  const KindIcon = route.season ? Snowflake : Sparkles;
  const kind = route.season?.name ?? labels.kind[route.kind];

  return (
    <div className="relative aspect-16/9 overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))] md:aspect-auto md:min-h-full">
      {photo === undefined ? (
        <div className="absolute inset-0 animate-pulse bg-white/10 motion-reduce:animate-none" />
      ) : (
        <img src={image.src} srcSet={image.srcSet} sizes="(min-width: 768px) 288px, 100vw" alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      )}
      {photo && <PhotoCredit page={photo.page} text={texts.deals.photoBy(photo.author, photo.license)} className="right-2 bottom-2" />}
      <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
        {(route.kind === "surprise" || route.season) && (
          <span className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            <KindIcon className="size-3" />
            {kind}
          </span>
        )}
        <span className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          <CalendarDays className="size-3" />
          {labels.days(tripDays(trip))}
        </span>
      </div>
    </div>
  );
};

export default RoutePhoto;
