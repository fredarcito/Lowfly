"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/context/i18n";

// Phones, at the top of the bottom bar in both steps (same two lines, so the buttons below never move): the
// route ("Cúcuta → Bucaramanga", or "Your route" until a town is picked) and its figures ("2 towns · 5 days ·
// 4 nights"). `form`: useManualTripForm.
const RouteLine = ({ form }) => {
  const { texts } = useI18n();
  const towns = form.stops.map((stop) => stop.place?.name).filter(Boolean).join(" → ") || texts.trips.route;
  const days = form.tripDays;
  const figures = [texts.trips.townsCount(form.stops.length), days && texts.trips.manual.stayLength(days, days - 1)].filter(Boolean).join(" · ");
  return (
    <div className="flex items-start gap-3">
      <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="grid min-w-0">
        <p className="truncate font-heading leading-6 font-bold">{towns}</p>
        <p className="truncate text-sm leading-5 text-muted-foreground">{figures}</p>
      </div>
    </div>
  );
};

export default RouteLine;
