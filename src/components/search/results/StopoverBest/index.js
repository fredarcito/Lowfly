"use client";

import { Info, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import Collapse from "@/components/shared/Collapse";
import DestinationGuide from "@/components/shared/DestinationGuide";
import EscapadaBox from "@/components/shared/EscapadaBox";
import FlightsToggle from "@/components/search/results/StopoverBest/components/FlightsToggle";
import SeparateTickets from "@/components/shared/SeparateTickets";
import StopoverFlights from "@/components/shared/StopoverFlights";
import WaySummary from "@/components/shared/WaySummary";
import { useI18n } from "@/context/i18n";
import { useCountUp } from "@/hooks/useCountUp";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useStopoverStops } from "@/hooks/useStopoverStops";
import SaveTripButton from "@/components/search/SaveTripButton";
import { airlineNames, isCachedFare } from "@/utils/format";

// The highlighted result when its best trip goes through a hub: what it is ("Basilea con escapada a Zagreb", the
// country and dates, the destination's guide), the price, the way there and back at a glance; the getaway (its
// city, how long, its guide and the way into the itinerary); then every flight with its own "Buy", which can be
// folded away. Desktop: the summary and the price side by side, the separate-tickets note under the flights.
// Phones: the price under the guide, and the note before the fold button, so it shows with the flights folded.
// "Save trip" keeps it with its towns, so its itinerary covers all of them. A flight priced from recent searches
// (easyJet, Vueling…) says so under the price.
const StopoverBest = ({ trip, origin }) => {
  const { texts, format } = useI18n();
  const stops = useStopoverStops(trip);
  const shownPrice = useCountUp(trip.price);
  const flights = useDisclosure(true);
  const results = texts.results;
  const roundTrip = trip.nights != null;
  const count = trip.legs.length;
  // A visit's days are the calendar days in the city: landing on the 23rd and leaving on the 24th is 2 days
  const title =
    trip.kind === "escapada" ? results.titleEscapada(trip.city, trip.via.city, trip.via.nights + 1) : results.titleConnection(trip.city, trip.via.city);
  const dates = roundTrip ? `${format.fmtDay(trip.day)} → ${format.fmtDay(trip.legs.at(-1).day)}` : format.fmtDay(trip.day);

  return (
    <Card className="grid gap-6 p-5 ring-2 ring-primary/40 sm:p-6">
      <div className="grid gap-5 [grid-template-areas:'head''price''way'] lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-x-6 lg:[grid-template-areas:'head_price''way_price']">
        <div className="flex gap-3 [grid-area:head]">
          <MapPin className="mt-1 size-6 shrink-0 fill-foreground stroke-card sm:size-7" />
          <div className="grid min-w-0 gap-1">
            <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl">{title}</h2>
            <p className="text-muted-foreground sm:text-lg">
              {trip.country} · {dates}
            </p>
            <DestinationGuide code={trip.code} collapsible className="mt-2 max-w-[62ch] pb-0" />
          </div>
        </div>

        <div className="grid content-start gap-1.5 [grid-area:price] lg:border-l lg:pl-6">
          <p className="font-heading text-5xl leading-none font-extrabold tracking-tight text-primary tabular-nums">
            <span aria-hidden="true">{format.money(shownPrice, trip.cur)}</span>
            <span className="sr-only">{format.money(trip.price, trip.cur)}</span>
          </p>
          <p className="text-muted-foreground">
            {roundTrip ? results.flightsRoundTrip : results.flightsOneWay} · {results.oneAdult}
          </p>
          <p className="text-sm text-muted-foreground">
            {results.flightCount(count)} · {airlineNames(trip)}
          </p>
          {/* easyJet, Vueling… on a getaway: prices seen in recent searches, not live */}
          {isCachedFare(trip) && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" />
              {results.cachedPrice(airlineNames({ legs: trip.legs.filter((leg) => leg.cached) }))}
            </p>
          )}
          <div className="mt-3 grid gap-2.5 max-lg:hidden">
            <FlightsToggle flights={flights} count={count} />
            <SaveTripButton origin={origin} fare={trip} stops={stops} className="h-11 w-full" />
          </div>
        </div>

        <div className="[grid-area:way]">
          <WaySummary trip={trip} />
        </div>
      </div>

      {trip.kind === "escapada" && <EscapadaBox trip={trip} />}

      <div className="grid gap-4 lg:hidden">
        <SeparateTickets count={count} />
        <FlightsToggle flights={flights} count={count} />
        <SaveTripButton origin={origin} fare={trip} stops={stops} className="h-11 w-full" />
      </div>

      <Collapse open={flights.open}>
        <div className="border-t pt-6">
          <StopoverFlights trip={trip} ticketsNote={<SeparateTickets count={count} className="border-t pt-4 max-lg:hidden" />} />
        </div>
      </Collapse>
    </Card>
  );
};

export default StopoverBest;
