"use client";

import Itinerary from "@/components/trips/itinerary/Itinerary";
import TripFlights from "@/components/trips/TripFlights";
import TripStops from "@/components/trips/TripStops";
import TripsPage from "@/components/trips/TripsPage";
import SharedTripCta from "@/components/trips/sharing/SharedTripCta";
import SharedTripHeader from "@/components/trips/sharing/SharedTripHeader";
import StickySave from "@/components/trips/sharing/SharedTrip/components/StickySave";
import { useSaveAfterSignIn } from "@/components/trips/sharing/SharedTrip/hooks/useSaveAfterSignIn";
import { useLocalizedTrip } from "@/hooks/useLocalizedTrip";

// A trip someone shared, read only: the same photo header, flights (or towns) and day-by-day plan as one's
// own trip (with the Maps routes and the destination facts), without what is only the owner's (editing,
// deleting, the visited ticks). It ends inviting to keep it or to make one's own (kept in the account: back
// from signing in to save it, it is saved on arrival).
const SharedTrip = ({ trip: sharedTrip, owner }) => {
  const trip = useLocalizedTrip(sharedTrip);
  useSaveAfterSignIn(sharedTrip);
  return (
    <TripsPage hero={<SharedTripHeader trip={trip} savedTrip={sharedTrip} owner={owner} />}>
      {trip.manual ? <TripStops trip={trip} /> : <TripFlights trip={trip} readOnly />}
      <Itinerary trip={trip} readOnly tabsAside={<StickySave trip={sharedTrip} />} />
      <SharedTripCta trip={sharedTrip} />
    </TripsPage>
  );
};

export default SharedTrip;
