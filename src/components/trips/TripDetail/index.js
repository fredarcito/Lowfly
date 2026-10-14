"use client";

import { useRouter } from "next/navigation";
import Itinerary from "@/components/trips/itinerary/Itinerary";
import TripFlights from "@/components/trips/TripFlights";
import TripHeader from "@/components/trips/TripHeader";
import TripStops from "@/components/trips/TripStops";
import TripsPage from "@/components/trips/TripsPage";
import { useI18n } from "@/context/i18n";
import { useLocalizedTrip } from "@/hooks/useLocalizedTrip";
import { ROUTES } from "@/constants/routes";

// One saved trip: its photo header, flights and the day-by-day itinerary.
// Until it is booked the flights go first (booking is the next step); once booked, the itinerary leads.
// A trip planned by hand shows its towns (arrival and departure) instead of flights.
const TripDetail = ({ trip: savedTrip }) => {
  const { lang } = useI18n();
  const trip = useLocalizedTrip(savedTrip);
  const router = useRouter();
  const backToList = () => router.replace(ROUTES.trips(lang));
  const flights = <TripFlights trip={trip} />;

  if (trip.manual) {
    return (
      <TripsPage hero={<TripHeader trip={trip} onDeleted={backToList} />}>
        <TripStops trip={trip} />
        <Itinerary trip={trip} />
      </TripsPage>
    );
  }

  return (
    <TripsPage hero={<TripHeader trip={trip} onDeleted={backToList} />}>
      {!trip.booked && flights}
      <Itinerary trip={trip} />
      {trip.booked && flights}
    </TripsPage>
  );
};

export default TripDetail;
