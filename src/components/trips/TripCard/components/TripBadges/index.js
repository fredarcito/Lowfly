"use client";

import { Bookmark, Clock, PenLine, Ticket } from "lucide-react";
import AirlineBadge from "@/components/shared/AirlineBadge";
import TripChip from "@/components/trips/TripChip";
import { useI18n } from "@/context/i18n";
import { useTripWhen } from "@/hooks/useTripWhen";
import { airlinesOf } from "@/utils/format";

// The state chip of each kind of trip: its icon, its colours and its text (a key of texts.trips)
const STATES = {
  manual: { icon: PenLine, label: "manualBadge" },
  booked: { icon: Ticket, label: "booked", className: "bg-save/15 text-save" },
  saved: { icon: Bookmark, label: "saved" },
};

// The first that applies: planned by hand, then booked; otherwise only saved
const stateOf = (trip) => ["manual", "booked"].find((state) => trip[state]) ?? "saved";

// Planned by hand, booked or only saved; when it is and the airlines
const TripBadges = ({ trip }) => {
  const { texts } = useI18n();
  const when = useTripWhen(trip);
  const state = STATES[stateOf(trip)];
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <TripChip icon={state.icon} className={state.className}>
        {texts.trips[state.label]}
      </TripChip>
      <TripChip icon={Clock}>
        <span className="first-letter:uppercase">{when}</span>
      </TripChip>
      {!trip.manual && airlinesOf(trip.fare).map((airline) => (
        <AirlineBadge key={airline} airline={airline} />
      ))}
    </div>
  );
};

export default TripBadges;
