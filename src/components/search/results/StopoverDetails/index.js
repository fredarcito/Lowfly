"use client";

import { Info } from "lucide-react";
import EscapadaBox from "@/components/shared/EscapadaBox";
import SeparateTickets from "@/components/shared/SeparateTickets";
import StopoverFlights from "@/components/shared/StopoverFlights";
import WaySummary from "@/components/shared/WaySummary";
import SaveTripButton from "@/components/search/SaveTripButton";
import { useI18n } from "@/context/i18n";
import { useStopoverStops } from "@/hooks/useStopoverStops";
import { airlineNames, isCachedFare } from "@/utils/format";

// An opened trip through a hub, made of the same pieces as the highlighted one (StopoverBest): the way there and back
// at a glance, the getaway (when it is one), every flight with its own "Buy", and "Save trip". The row above already
// says the dates and the total, and the destination's guide is the highlighted card's.
const StopoverDetails = ({ trip, origin }) => {
  const { texts } = useI18n();
  const stops = useStopoverStops(trip);
  return (
    <div className="grid gap-6 px-4 pt-2 pb-5 sm:px-5">
      <WaySummary trip={trip} />
      {trip.kind === "escapada" && <EscapadaBox trip={trip} />}
      <div className="border-t pt-5">
        <StopoverFlights
          trip={trip}
          ticketsNote={
            <div className="grid gap-2 border-t pt-4">
              <SeparateTickets count={trip.legs.length} />
              {isCachedFare(trip) && (
                <p className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Info className="mt-px size-4 shrink-0" />
                  {texts.results.cachedPrice(airlineNames(trip))}
                </p>
              )}
            </div>
          }
          action={<SaveTripButton origin={origin} fare={trip} stops={stops} hint={false} className="h-10 px-4 text-sm sm:w-auto" />}
        />
      </div>
    </div>
  );
};

export default StopoverDetails;
