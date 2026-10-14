"use client";

import { ArrowLeftRight, ArrowRight, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BagEstimate from "@/components/shared/BagEstimate";
import DestinationGuide from "@/components/shared/DestinationGuide";
import CompactFareBody from "@/components/shared/CompactFareBody";
import FareLegs from "@/components/shared/FareLegs";
import SaveTripButton from "@/components/search/SaveTripButton";
import { useI18n } from "@/context/i18n";
import { useCountUp } from "@/hooks/useCountUp";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { cn } from "@/utils/cn";

// The highlighted result on phones and tablets: destination and price first, then each flight and the baggage
// folded into a row and the description in three lines (CompactFareBody), and the booking buttons in reach.
const BestPriceCompact = ({ price, cur, title, links, priceNote, fare, origin, label, className }) => {
  const { lang, t, f } = useI18n();
  const shownPrice = useCountUp(price);
  const airports = useAirports(lang);
  const RouteIcon = fare.ret ? ArrowLeftRight : ArrowRight;
  const originName = findAirport(airports, origin)?.city;

  return (
    <Card className={cn("gap-0 p-4 ring-2 ring-primary/40 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3 pb-4">
        <div className="flex min-w-0 gap-2">
          <MapPin className="mt-1 size-5 shrink-0 fill-foreground stroke-card" />
          <div className="grid min-w-0 gap-1">
            <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-balance">{title}</h2>
            <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
              <span>{originName ? `${originName} (${origin})` : origin}</span>
              <RouteIcon className="size-3.5 shrink-0" />
              <span>
                {fare.city} ({fare.code})
              </span>
            </p>
          </div>
        </div>
        <div className="grid shrink-0 justify-items-end gap-1.5 text-right">
          <p className="font-heading text-3xl leading-none font-extrabold tracking-tight text-primary tabular-nums">
            <span aria-hidden="true">{f.money(shownPrice, cur)}</span>
            <span className="sr-only">{f.money(price, cur)}</span>
          </p>
          <p className="text-xs text-muted-foreground first-letter:uppercase">
            {priceNote ?? t.form.oneway} · {t.results.oneAdult}
          </p>
          <Badge className="gap-1">
            <Sparkles />
            {label ?? t.results.cheapest}
          </Badge>
        </div>
      </div>

      <CompactFareBody fare={fare} origin={origin} />

      {links.length > 0 && (
        <div className="grid gap-2.5 border-t pt-4">
          {links.map((link) => (
            <Button key={link.href} asChild size="lg" className="h-12 w-full text-base font-bold">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
                <ExternalLink />
              </a>
            </Button>
          ))}
          {fare.city && <SaveTripButton origin={origin} fare={fare} className="h-12 w-full" />}
        </div>
      )}
    </Card>
  );
};

// The highlighted result at the top. `links` are the booking buttons ({ label, href }).
// With `fare` and `origin`: the route, each flight (times, length, airline, price) and "Save trip".
// Without them (flexible dates): `title` and `detail` explain the result.
// Desktop: destination and flights on the left, price and actions on the right.
// Phone: destination, then price and actions, then the flights.
const BestPrice = ({ price, cur, title, detail, links = [], priceNote, fare, origin, label }) => {
  const { lang, t, f } = useI18n();
  const shownPrice = useCountUp(price);
  const airports = useAirports(lang);
  const withFlights = Boolean(fare && origin);
  const RouteIcon = fare?.ret ? ArrowLeftRight : ArrowRight;
  const originName = findAirport(airports, origin)?.city;

  const compact = withFlights && (
    <BestPriceCompact price={price} cur={cur} title={title} links={links} priceNote={priceNote} fare={fare} origin={origin} label={label} className="lg:hidden" />
  );

  return (
    <>
      {compact}
      <Card className={cn("grid gap-0 p-0 ring-2 ring-primary/40 [grid-template-areas:'head''price''legs'] lg:grid-cols-[minmax(0,1fr)_18rem] lg:[grid-template-areas:'head_price''legs_price']", withFlights && "max-lg:hidden")}>
        <div className="flex gap-3 px-5 pt-5 [grid-area:head] sm:px-6 sm:pt-6">
          {withFlights && <MapPin className="mt-1 size-6 shrink-0 fill-foreground stroke-card sm:size-7" />}
          <div className="grid min-w-0 gap-1">
            <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl">{title}</h2>
            {withFlights ? (
              <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground sm:text-lg">
                <span>{originName ? `${originName} (${origin})` : origin}</span>
                <RouteIcon className="size-4 shrink-0" />
                <span>
                  {fare.city} ({fare.code})
                </span>
              </p>
            ) : (
              detail && <p className="text-muted-foreground">{detail}</p>
            )}
            {withFlights && <DestinationGuide code={fare.code} className="mt-2 max-w-[62ch]" />}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 py-5 [grid-area:price] sm:px-6 lg:my-6 lg:justify-center lg:border-l lg:py-0">
          <Badge className="gap-1 self-start">
            <Sparkles />
            {label ?? t.results.cheapest}
          </Badge>
          <p className="font-heading text-5xl leading-none font-extrabold tracking-tight text-primary tabular-nums">
            <span aria-hidden="true">{f.money(shownPrice, cur)}</span>
            <span className="sr-only">{f.money(price, cur)}</span>
          </p>
          {withFlights && (
            <div className="grid gap-1.5">
              <p className="text-muted-foreground first-letter:uppercase">
                {priceNote ?? t.form.oneway} · {t.results.oneAdult}
              </p>
              <BagEstimate fare={fare} large className="mt-4" />
            </div>
          )}
          {links.length > 0 && (
            <div className="mt-3 grid gap-2.5">
              {links.map((link) => (
                <Button key={link.href} asChild size="lg" className="h-12 w-full text-base font-bold">
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                    <ExternalLink />
                  </a>
                </Button>
              ))}
              {withFlights && fare.city && <SaveTripButton origin={origin} fare={fare} className="h-12 w-full" />}
            </div>
          )}
        </div>

        {withFlights && (
          <div className="px-5 pb-5 [grid-area:legs] sm:px-6 sm:pb-6">
            <FareLegs fare={fare} origin={origin} />
          </div>
        )}
      </Card>
    </>
  );
};

export default BestPrice;
