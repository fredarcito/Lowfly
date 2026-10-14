"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Itinerary from "@/components/trips/itinerary/Itinerary";
import TripFlights from "@/components/trips/TripFlights";
import TripHeader from "@/components/trips/TripHeader";
import { useI18n } from "@/context/i18n";
import { useLocalizedTrip } from "@/hooks/useLocalizedTrip";
import { ROUTES } from "@/constants/routes";

// One saved trip: header, flights and the day-by-day itinerary.
// Until it is booked the flights go first (booking is the next step); once booked, the itinerary leads.
export default function TripDetail({ trip: savedTrip }) {
  const { lang, t } = useI18n();
  const trip = useLocalizedTrip(savedTrip);
  const router = useRouter();
  const backToList = () => router.replace(ROUTES.trips(lang));
  const flights = <TripFlights trip={trip} />;

  return (
    <>
      <Link
        href={ROUTES.trips(lang)}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t.trips.backToList}
      </Link>

      <TripHeader trip={trip} onDeleted={backToList} />
      {!trip.booked && flights}
      <Itinerary trip={trip} />
      {trip.booked && flights}
    </>
  );
}
