"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveTripButton from "@/components/search/SaveTripButton";
import FareLegs from "@/components/shared/FareLegs";
import { useI18n } from "@/context/i18n";

// An opened result, like the "Cheapest" card: each flight (times, length, airline, price), then the total,
// booking with the airline and "Save trip". Desktop: flights on the left, price and actions on the right.
export default function FareDetails({ fare, origin }) {
  const { t, f } = useI18n();
  const links = f.fareLinks(fare, origin);
  return (
    <div className="grid gap-4 px-4 pb-4 sm:px-5 sm:pb-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center lg:gap-6">
      <FareLegs fare={fare} origin={origin} />
      <div className="grid gap-3">
        <div className="flex items-baseline justify-between gap-3 lg:grid lg:justify-start lg:gap-1">
          <p className="font-heading text-3xl leading-none font-extrabold tracking-tight text-primary tabular-nums">{f.money(fare.price, fare.cur)}</p>
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {fare.ret ? t.results.roundTrip : t.form.oneway} · {t.results.oneAdult}
          </p>
        </div>
        <div className="grid gap-2">
          {links.map((link) => (
            <Button key={link.href} asChild className="h-11 w-full font-bold">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label} <ExternalLink />
              </a>
            </Button>
          ))}
          {fare.city && <SaveTripButton origin={origin} fare={fare} className="h-11 w-full text-sm" />}
        </div>
      </div>
    </div>
  );
}
