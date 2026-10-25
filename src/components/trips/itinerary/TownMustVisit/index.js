"use client";

import MustVisitSection from "@/components/shared/MustVisitSection";
import MustVisitField from "@/components/trips/itinerary/MustVisitField";
import { useTownMustVisit } from "@/components/trips/itinerary/TownMustVisit/hooks/useTownMustVisit";
import { useI18n } from "@/context/i18n";
import { MUST_VISIT_MAX } from "@/constants/itineraryPreferences";
import { daysBetween } from "@/utils/dates";

// The places to visit for sure on a trip planned by hand, in its itinerary card (to make it, or to make it again):
// the same section as a flight trip's, with each town's own places under its name, searched around that town.
// They are the ones chosen in the planner's town cards, and go to the AI with their town.
const TownMustVisit = ({ trip, className }) => {
  const { texts } = useI18n();
  const labels = texts.trips.preferences.mustVisit;
  const towns = useTownMustVisit(trip);

  return (
    <MustVisitSection id="must-visit" note={labels.notePerTown(MUST_VISIT_MAX)} className={className}>
      <div className="grid gap-4">
        {trip.stops.map((stop, townIndex) => (
          <div key={`${stop.city}-${stop.arrive.day}`} className="grid gap-2">
            <p className="text-sm font-medium">{stop.city}</p>
            <MustVisitField
              id={`must-visit-${townIndex}`}
              inline
              help={false}
              label={labels.townLabel(stop.city)}
              places={towns.placesOf(townIndex)}
              onAdd={(place) => towns.add(townIndex, place)}
              onRemove={(placeIndex) => towns.remove(townIndex, placeIndex)}
              near={{ lat: stop.lat, lng: stop.lng }}
              town={stop.city}
              days={daysBetween(stop.arrive.day, stop.leave.day).length}
            />
          </div>
        ))}
      </div>
    </MustVisitSection>
  );
};

export default TownMustVisit;
