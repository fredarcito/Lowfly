"use client";

import { useSearchParams } from "next/navigation";
import TripDetail from "@/components/trips/TripDetail";
import TripList from "@/components/trips/TripList";
import TripNotFound from "@/components/trips/TripNotFound";
import TripsPage from "@/components/trips/TripsPage";
import { useMounted } from "@/hooks/useMounted";
import { useTrip } from "@/hooks/useTrips";

// "My trips" (/es/trips): the saved trips, one of them with ?id=… (with its own photo header) or "not found".
// One static page for both, since the trips only live in the browser.
export default function TripsApp() {
  // The trips are only known in the browser: until then, show nothing rather than "no trips" for a moment
  const mounted = useMounted();
  const id = useSearchParams().get("id");
  const trip = useTrip(id);

  if (mounted && trip) return <TripDetail trip={trip} />;
  return <TripsPage>{mounted && (id ? <TripNotFound /> : <TripList />)}</TripsPage>;
}
