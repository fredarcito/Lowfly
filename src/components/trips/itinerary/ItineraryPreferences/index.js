"use client";

import { BedDouble, Gauge, TrainFront, Utensils } from "lucide-react";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import { useI18n } from "@/context/i18n";
import { CHECK_IN_TIMES, INTERESTS, PACES, TRANSPORTS } from "@/constants/itineraryPreferences";
import { cn } from "@/utils/cn";

// The visitor's preferences for the AI itinerary: pace, interests, getting around and check-in time.
// `preferences`: useItineraryPreferences of the trip (the values and how to change them). `stacked`: one under
// the other (the wizard's step 2); otherwise side by side from tablets up.
const ItineraryPreferences = ({ trip, preferences, disabled, stacked = false }) => {
  const { texts } = useI18n();
  const labels = texts.trips.preferences;
  const optionsOf = (ids, names) => ids.map((id) => ({ id, label: names[id] }));
  const { pace, interests, transport, checkIn } = preferences.preferences;
  // A trip planned by hand has no check-in: one time could not fit every town, and its arrival times already
  // tell the AI when to check in (server/itinerary)
  return (
    <fieldset
      disabled={disabled}
      className={cn("grid gap-4 disabled:opacity-60", !stacked && "sm:grid-cols-2", !stacked && (trip.manual ? "lg:grid-cols-3" : "lg:grid-cols-4"))}
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
        id="interests"
        icon={Utensils}
        label={labels.interests}
        options={optionsOf(INTERESTS, labels.interestNames)}
        values={interests}
        onToggle={preferences.toggleInterest}
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
    </fieldset>
  );
};

export default ItineraryPreferences;
