"use client";

import { BedDouble, Gauge, TrainFront } from "lucide-react";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import InterestChips from "@/components/trips/itinerary/ItineraryPreferences/components/InterestChips";
import MustVisitField from "@/components/trips/itinerary/MustVisitField";
import TownMustVisit from "@/components/trips/itinerary/TownMustVisit";
import { useI18n } from "@/context/i18n";
import { CHECK_IN_TIMES, INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";
import { cn } from "@/utils/cn";

// The visitor's preferences for the AI itinerary: pace, interests, getting around, check-in time and, on a flight
// trip, the places they want for sure.
// `preferences`: useItineraryPreferences of the trip (the values and how to change them). `stacked`: one under
// the other (the wizard's step 2); otherwise side by side from tablets up.
const ItineraryPreferences = ({ trip, preferences, disabled, stacked = false, townPlaces = false }) => {
  const { texts } = useI18n();
  const labels = texts.trips.preferences;
  const optionsOf = (ids, names) => ids.map((id) => ({ id, label: names[id] }));
  const { pace, interests, transport, checkIn, mustVisit } = preferences.preferences;
  // A trip planned by hand has no check-in: one time could not fit every town, and its arrival times already
  // tell the AI when to check in (server/itinerary)
  return (
    <fieldset
      disabled={disabled}
      className={cn("grid gap-4 disabled:opacity-60", !stacked && "sm:grid-cols-2", !stacked && (trip.manual ? "lg:grid-cols-2" : "lg:grid-cols-3"))}
    >
      <PreferencePicker
        id="pace"
        icon={Gauge}
        label={labels.pace}
        options={optionsOf(PACES, labels.paces)}
        value={pace}
        onChange={preferences.setPace}
      />
      <PreferencePicker
        id="transport"
        icon={TrainFront}
        label={labels.transport}
        options={optionsOf(TRANSPORTS, labels.transports)}
        value={transport}
        onChange={preferences.setTransport}
      />
      {!trip.manual && (
        <PreferencePicker
          id="check-in"
          icon={BedDouble}
          label={labels.checkIn}
          options={CHECK_IN_TIMES.map((time) => ({ id: time, label: time }))}
          value={checkIn}
          onChange={preferences.setCheckIn}
        />
      )}
      {/* In view, on a row of its own */}
      <InterestChips
        id="interests"
        label={labels.interests}
        note={labels.interestsNote}
        options={optionsOf(INTERESTS, labels.interestNames)}
        values={interests}
        onToggle={preferences.toggleInterest}
        className="col-span-full"
      />
      {/* A trip planned by hand keeps them on its towns: chosen in the planner's town cards (so not in its step 2,
          `townPlaces` false) and changed here, town by town, in the itinerary card */}
      {trip.manual && townPlaces && <TownMustVisit trip={trip} className="col-span-full" />}
      {!trip.manual && (
        <MustVisitField
          id="must-visit"
          places={mustVisit}
          onAdd={preferences.addMustVisit}
          onRemove={preferences.removeMustVisit}
          near={{ code: trip.fare.code }}
          town={trip.fare.city}
          days={trip.fare.ret ? trip.fare.nights + 1 : 1}
          className="col-span-full"
        />
      )}
    </fieldset>
  );
};

export default ItineraryPreferences;
