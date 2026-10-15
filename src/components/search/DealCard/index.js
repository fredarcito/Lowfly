"use client";

import { ArrowRight } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import DestinationGuide from "@/components/shared/DestinationGuide";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";
import DealPhoto from "@/components/search/DealCard/components/DealPhoto";
import NoTimeOffAlternative from "@/components/search/DealCard/components/NoTimeOffAlternative";

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
