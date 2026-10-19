"use client";

import { useRouter } from "next/navigation";
import Itinerary from "@/components/trips/itinerary/Itinerary";
import TripFlights from "@/components/trips/TripFlights";
import TripHeader from "@/components/trips/TripHeader";
import TripStops from "@/components/trips/TripStops";
import SeparateTickets from "@/components/shared/SeparateTickets";
import StopoverFlights from "@/components/shared/StopoverFlights";
import TripsPage from "@/components/trips/TripsPage";
import { useI18n } from "@/context/i18n";
import { useLocalizedTrip } from "@/hooks/useLocalizedTrip";
import { ROUTES } from "@/constants/routes";

// One saved trip: its photo header, the day-by-day itinerary and, under it, the flights.
// A trip planned by hand shows its towns (arrival and departure) instead of flights; one through a hub (saved from
// the search), its towns and then its flights.
const TripDetail = ({ trip: savedTrip }) => {
  const { lang } = useI18n();
  const trip = useLocalizedTrip(savedTrip);
  const router = useRouter();
  const backToList = () => router.replace(ROUTES.trips(lang));

  if (trip.manual) {
    return (
      <TripsPage hero={<TripHeader trip={trip} onDeleted={backToList} />}>
        <TripStops trip={trip} />
        <Itinerary trip={trip} />
        {trip.flights && (
          <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
            <StopoverFlights trip={trip.flights} ticketsNote={<SeparateTickets count={trip.flights.legs.length} className="border-t pt-4" />} />
          </section>
        )}
      </TripsPage>
    );
  }

  return (
    <TripsPage hero={<TripHeader trip={trip} onDeleted={backToList} />}>
      <Itinerary trip={trip} />
      <TripFlights trip={trip} />
    </TripsPage>
  );
};

export default TripDetail;
