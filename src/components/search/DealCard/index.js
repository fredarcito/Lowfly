"use client";

import { ArrowRight, CornerDownRight, Plane } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import DestinationGuide from "@/components/shared/DestinationGuide";
import PhotoCredit from "@/components/shared/PhotoCredit";
import SaveTripButton from "@/components/search/SaveTripButton";
import { useI18n } from "@/context/i18n";
import { usePhoto } from "@/hooks/usePhoto";
import { airlinesOf } from "@/utils/format";
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

// The cheaper trip of the same destination that needs no time off work, as a strip at the bottom of the card
const NoTimeOffAlternative = ({ fare, origin }) => {
  const { texts, format } = useI18n();
  return (
    <a
      href={format.fareLinks(fare, origin)[0].href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${texts.results.noTimeOffHint} · ${format.weekendDates(fare)}`}
      className="relative z-10 -mx-4 -mb-4 flex items-center gap-2 border-t bg-save/10 px-4 py-2 text-xs font-medium text-save hover:bg-save/20"
    >
      <CornerDownRight className="size-3.5" />
      {texts.deals.noTimeOffFrom(format.money(fare.price, fare.cur))}
      <ArrowRight className="ml-auto size-3.5" />
    </a>
  );
};

// A weekend destination with its photo. The whole card opens the booking; the no-time-off alternative and the
// photo credit are links of their own on top of it.
const DealCard = ({ fare, origin }) => {
  const { texts, format } = useI18n();
  return (
    <article className="group relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg hover:ring-foreground/20 sm:w-auto">
      <DealPhoto fare={fare} origin={origin} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-heading text-lg leading-tight font-semibold">
            {/* Stretched link: the whole card */}
            <a
              href={format.fareLinks(fare, origin)[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {fare.city}, <span className="font-normal text-muted-foreground">{fare.country}</span>
            </a>
          </h3>
          <span className="grid shrink-0 justify-items-end">
            <span className="font-heading text-xl font-extrabold tabular-nums">{format.money(fare.price, fare.cur)}</span>
            <span className="text-xs text-muted-foreground">{texts.results.roundTrip}</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{format.weekendDates(fare)}</p>
        <DestinationGuide code={fare.code} tagsOnly />
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="flex gap-1.5">
            {airlinesOf(fare).map((airline) => (
              <AirlineBadge key={airline} airline={airline} />
            ))}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary-ink">
            {texts.deals.viewFlights}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
        {fare.noTimeOffAlt && <NoTimeOffAlternative fare={fare.noTimeOffAlt} origin={origin} />}
      </div>
    </article>
  );
};

export default DealCard;
