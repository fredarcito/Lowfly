"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveTripButton from "@/components/search/SaveTripButton";
import BagEstimate from "@/components/shared/BagEstimate";
import DestinationGuide from "@/components/shared/DestinationGuide";
import FareLegs from "@/components/shared/FareLegs";
import { useI18n } from "@/context/i18n";

// An opened result: why go, each flight (times, length, airline; and each price on a return trip), then a
// strip with the total, the estimated extra baggage and booking with the airline or "Save trip".
// Desktop: the strip in three columns, the buttons stacked in a narrow one so the price and the baggage have
// room; tablet: the buttons side by side; phone: one under the other, buttons full width.
const FareDetails = ({ fare, origin }) => {
  const { t, f } = useI18n();
  const links = f.fareLinks(fare, origin);
  const footer = (
    <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_15rem] lg:items-center lg:gap-0 lg:divide-x">
      <div className="grid gap-1.5 lg:pr-8">
        <p className="font-heading text-4xl leading-none font-extrabold tracking-tight text-primary tabular-nums lg:text-5xl">{f.money(fare.price, fare.cur)}</p>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {fare.ret ? t.results.roundTrip : t.form.oneway} · {t.results.oneAdult}
        </p>
      </div>
      <BagEstimate fare={fare} className="lg:px-8" />
      <div className="grid gap-2.5 sm:grid-flow-col sm:auto-cols-fr lg:grid-flow-row lg:pl-6">
        {links.map((link) => (
          <Button key={link.href} asChild className="h-11 w-full px-5 text-base font-bold">
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} <ExternalLink />
            </a>
          </Button>
        ))}
        {fare.city && <SaveTripButton origin={origin} fare={fare} className="h-11 w-full px-5 text-base" />}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
      <DestinationGuide code={fare.code} className="max-w-[65ch] pt-0" />
      <FareLegs fare={fare} origin={origin} legPrices={Boolean(fare.ret)} footer={footer} />
    </div>
  );
};

export default FareDetails;
