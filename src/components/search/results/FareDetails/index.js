"use client";

import { ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveTripButton from "@/components/search/SaveTripButton";
import BagEstimate from "@/components/shared/BagEstimate";
import CompactFareBody from "@/components/shared/CompactFareBody";
import DestinationGuide from "@/components/shared/DestinationGuide";
import FareLegs from "@/components/shared/FareLegs";
import { useI18n } from "@/context/i18n";
import { airlineNames, isCachedFare } from "@/utils/format";

// An opened result: why go, each flight (times, length, airline; and each price on a return trip), then a
// strip with the total, the estimated extra baggage and booking with the airline or "Save trip". A price from
// recent searches (more airlines) says so: the airline confirms it.
// Desktop: the strip in three columns, the buttons stacked in a narrow one so the price and the baggage have
// room. Phones and tablets: the compact card (CompactFareBody), the price being already on the row above.
const FareDetails = ({ fare, origin }) => {
  const { texts, format } = useI18n();
  const links = format.fareLinks(fare, origin);
  const cachedNote = isCachedFare(fare) && (
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <Info className="mt-px size-3.5 shrink-0" />
      {texts.results.cachedPrice(airlineNames(fare))}
    </p>
  );
  const actions = (
    <>
      {links.map((link) => (
        <Button key={link.href} asChild className="h-11 w-full px-5 text-base font-bold">
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label} <ExternalLink />
          </a>
        </Button>
      ))}
      {fare.city && <SaveTripButton origin={origin} fare={fare} className="h-11 w-full" />}
    </>
  );
  const footer = (
    <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_17rem] lg:items-center lg:gap-0 lg:divide-x">
      <div className="grid gap-1.5 lg:pr-8">
        <p className="font-heading text-4xl leading-none font-extrabold tracking-tight text-primary tabular-nums lg:text-5xl">{format.money(fare.price, fare.cur)}</p>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {fare.ret ? texts.results.roundTrip : texts.form.oneway} · {texts.results.oneAdult}
        </p>
        {cachedNote}
      </div>
      <BagEstimate fare={fare} className="lg:px-8" />
      <div className="grid grid-cols-1 gap-2.5 lg:pl-6">{actions}</div>
    </div>
  );

  return (
    <>
      <div className="grid px-4 pb-4 sm:px-5 lg:hidden">
        <CompactFareBody fare={fare} origin={origin} firstLine={false} />
        {cachedNote && <div className="pb-3">{cachedNote}</div>}
        <div className="grid gap-2.5 border-t pt-4 sm:grid-flow-col sm:auto-cols-fr">{actions}</div>
      </div>
      <div className="grid gap-4 px-5 pb-5 max-lg:hidden">
        <DestinationGuide code={fare.code} className="max-w-[65ch] pt-0" />
        <FareLegs fare={fare} origin={origin} legPrices={Boolean(fare.ret)} footer={footer} />
      </div>
    </>
  );
};

export default FareDetails;
