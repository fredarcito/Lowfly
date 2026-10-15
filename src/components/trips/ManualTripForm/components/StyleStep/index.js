"use client";

import { useRouter } from "next/navigation";
import CreateItinerary from "@/components/trips/itinerary/CreateItinerary";
import ItineraryLoader from "@/components/trips/itinerary/ItineraryLoader";
import { useItinerary } from "@/components/trips/itinerary/Itinerary/hooks/useItinerary";
import { useOpenWhenCreated } from "@/components/trips/ManualTripForm/components/StyleStep/hooks/useOpenWhenCreated";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

// Step 2: the pace and interests for the trip just saved, and creating its itinerary here (the wizard and his
// phrases while the AI works), then the trip opens with it. Or back to the route, or leave it for later.
const StyleStep = ({ trip, onBack }) => {
  const { lang } = useI18n();
  const router = useRouter();
  const { create, creation } = useItinerary(trip);
  useOpenWhenCreated(trip);

  if (creation.status === "creating" || trip.itinerary) return <ItineraryLoader />;
  return (
    <CreateItinerary
      trip={trip}
      onCreate={create}
      creation={creation}
      onBack={onBack}
      onSkip={() => router.push(ROUTES.trip(lang, trip.id))}
    />
  );
};

export default StyleStep;
