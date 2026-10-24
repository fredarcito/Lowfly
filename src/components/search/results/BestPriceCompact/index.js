"use client";

import { ArrowLeftRight, ArrowRight, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SaveTripButton from "@/components/search/SaveTripButton";
import CompactFareBody from "@/components/shared/CompactFareBody";
import PerPersonPrice from "@/components/shared/PerPersonPrice";
import { useI18n } from "@/context/i18n";
import { useCountUp } from "@/hooks/useCountUp";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { cn } from "@/utils/cn";

// The highlighted result on phones and tablets: destination and price first, then each flight and the baggage
// folded into a row and the description in three lines (CompactFareBody), and the booking buttons in reach.
const BestPriceCompact = ({ price, cur, title, links, priceNote, fare, origin, label, className }) => {
  const { lang, texts, format } = useI18n();
  const groupPrice = format.forGroup(price);
  const shownPrice = useCountUp(groupPrice);
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
            <span aria-hidden="true">{format.money(shownPrice, cur)}</span>
            <span className="sr-only">{format.money(groupPrice, cur)}</span>
          </p>
          <p className="text-xs text-muted-foreground first-letter:uppercase">
            {priceNote ?? texts.form.oneway} · {format.adultsLabel}
          </p>
          <PerPersonPrice price={price} cur={cur} className="text-xs" />
          <Badge className="gap-1">
            <Sparkles />
            {label ?? texts.results.cheapest}
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

export default BestPriceCompact;
