"use client";

import { useSearchParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import TripDetail from "@/components/TripDetail";
import TripList from "@/components/TripList";
import TripNotFound from "@/components/TripNotFound";
import { useMounted } from "@/hooks/useMounted";
import { useTrip } from "@/hooks/useTrips";

// The list, one trip (?id=…) or "not found"
function TripsContent() {
  const id = useSearchParams().get("id");
  const trip = useTrip(id);
  if (!id) return <TripList />;
  return trip ? <TripDetail trip={trip} /> : <TripNotFound />;
}

// "My trips" (/es/trips): the saved trips, or one of them with ?id=…
// One static page for both, since the trips only live in the browser.
export default function TripsApp() {
  // The trips are only known in the browser: until then, show nothing rather than "no trips" for a moment
  const mounted = useMounted();
  return (
    <>
      <header className="bg-(image:--hero) px-4 pt-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-8 text-hero-foreground sm:px-6">
        <TopBar className="mx-auto max-w-5xl" />
      </header>
      <main className="mx-auto grid max-w-[calc(64rem+3rem)] gap-6 px-4 pt-2 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] sm:px-6">
        {mounted && <TripsContent />}
      </main>
    </>
  );
}
