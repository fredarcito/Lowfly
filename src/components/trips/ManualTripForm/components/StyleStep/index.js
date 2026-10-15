"use client";

import ErrorNote from "@/components/shared/ErrorNote";
import PreferencesCard from "@/components/trips/ManualTripForm/components/StyleStep/components/PreferencesCard";
import ItineraryLoader from "@/components/trips/itinerary/ItineraryLoader";
import SignInToCreate from "@/components/trips/itinerary/SignInToCreate";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// Step 2: the preferences card or, while the AI creates the itinerary, the wizard and his phrases. Without free
// itineraries left, signing in comes first. Its actions are the wizard's (summary and bottom bar).
// `trip`: the trip saved on leaving step 1; `style`: useStyleStep; `enterClassName`: how the column arrives.
const StyleStep = ({ trip, style, enterClassName }) => {
  const { lang } = useI18n();
  return (
    <div className={cn("grid gap-4", enterClassName)}>
      {style.creating ? (
        <div className="duration-300 animate-in fade-in motion-reduce:animate-none">
          <ItineraryLoader />
        </div>
      ) : (
        <>
          <PreferencesCard trip={trip} preferences={style.preferences} />
          {style.creation.status === "error" && !style.needsAccount && <ErrorNote error={style.creation.error} />}
          {style.needsAccount && <SignInToCreate next={ROUTES.trip(lang, trip.id)} />}
        </>
      )}
    </div>
  );
};

export default StyleStep;
