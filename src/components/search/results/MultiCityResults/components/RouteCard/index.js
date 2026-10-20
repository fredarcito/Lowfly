"use client";

import { useMemo } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import Collapse from "@/components/shared/Collapse";
import StopoverFlights from "@/components/shared/StopoverFlights";
import SaveTripButton from "@/components/search/SaveTripButton";
import FlightPair from "@/components/search/results/MultiCityResults/components/RouteCard/components/FlightPair";
import LengthPicker from "@/components/search/results/MultiCityResults/components/RouteCard/components/LengthPicker";
import PlanButton from "@/components/search/results/MultiCityResults/components/RouteCard/components/PlanButton";
import RoutePhoto from "@/components/search/results/MultiCityResults/components/RouteCard/components/RoutePhoto";
import TownChain from "@/components/shared/TownChain";
import { useRouteTrip } from "@/components/search/results/MultiCityResults/components/RouteCard/hooks/useRouteTrip";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { savedTownsOf } from "@/utils/multiCity";
import { airlineNames, isCachedFare } from "@/utils/format";
import { cn } from "@/utils/cn";

// One route of the results: its photo, name and countries, the lengths it comes in (by its dates), how many towns
// (and countries) it visits, the towns with their nights and the ways by land between them, the two flights and their
// price, and the way into the itinerary ("Genera tu itinerario personalizado"); "Save trip" keeps it with its towns.
// The flights, each with its own "Buy", fold out in a row of their own under the photo and the summary, the whole
// card's width, so opening them does not stretch the photo. `preferred`: the length filter's version, shown when the
// route has it.
const RouteCard = ({ route, origin, preferred }) => {
  const { texts, format } = useI18n();
  const labels = texts.multiCity;
  const { trip, choose } = useRouteTrip(route, preferred);
  const flights = useDisclosure();
  const stops = useMemo(() => savedTownsOf(trip), [trip]);
  // A loop comes back to its first town: each town and country once
  const townCount = new Set(trip.towns.map((town) => town.city)).size;
  const countryCount = new Set(trip.towns.map((town) => town.countryCode)).size;

  return (
    <Card className="gap-0 p-0 md:grid md:grid-cols-[18rem_minmax(0,1fr)]">
      <RoutePhoto route={route} trip={trip} />
      <div className="grid min-w-0 gap-4 p-5 sm:p-6">
        <div className="grid gap-1">
          <h3 className="font-heading text-xl leading-tight font-bold tracking-tight text-balance sm:text-2xl">{route.name}</h3>
          <p className="text-sm text-muted-foreground">
            {route.countries.join(" · ")} · {format.fmtDay(trip.day)} → {format.fmtDay(trip.legs.at(-1).day)}
          </p>
          {route.trips.length > 1 && (
            <div className="mt-1.5">
              <LengthPicker trips={route.trips} value={trip.version} onChange={choose} />
            </div>
          )}
          <p className="mt-1 max-w-[65ch] text-sm">{route.summary}</p>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-semibold">{labels.visits(townCount, countryCount)}</p>
          <TownChain towns={trip.towns} />
        </div>

        <div className="grid gap-3 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
          <FlightPair trip={trip} />
          <div className="grid sm:justify-items-end">
            <p className="font-heading text-3xl leading-none font-extrabold tracking-tight text-primary tabular-nums">{format.money(trip.price, trip.cur)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {labels.flightsFrom} · {labels.oneAdult}
            </p>
          </div>
        </div>

        {/* easyJet, Vueling…: prices seen in recent searches, not live: the airline confirms them */}
        {isCachedFare(trip) && (
          <p className="-mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-px size-3.5 shrink-0" />
            {texts.results.cachedPrice(airlineNames({ legs: trip.legs.filter((leg) => leg.cached) }))}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-start">
          <PlanButton trip={trip} className="w-full" />
          <SaveTripButton origin={origin} fare={trip} stops={stops} hint={false} className="h-11" />
        </div>

        <button
          type="button"
          onClick={flights.toggle}
          aria-expanded={flights.open}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary-ink hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {flights.open ? labels.hideFlights : labels.showFlights}
          <ChevronDown className={cn("size-4 transition-transform", flights.open && "rotate-180")} />
        </button>

        {route.note && (
          <p className="border-t pt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{labels.goodToKnow}: </span>
            {route.note}
          </p>
        )}
      </div>

      <Collapse open={flights.open} className="md:col-span-2">
        <div className="border-t p-5 sm:p-6">
          <StopoverFlights
            trip={trip}
            ticketsNote={
              <p className="flex items-start gap-2.5 border-t pt-4 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {labels.separate}
              </p>
            }
          />
        </div>
      </Collapse>
    </Card>
  );
};

export default RouteCard;
