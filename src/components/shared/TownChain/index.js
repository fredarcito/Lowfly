"use client";

import { Fragment } from "react";
import { Bus, Car, MapPin, Ship, TrainFront } from "lucide-react";
import { useI18n } from "@/context/i18n";

const LAND_ICONS = { train: TrainFront, bus: Bus, ferry: Ship, car: Car };

// The towns of a trip in order, each with its nights ("de paso" with none), and between them how you get there by
// land (indicative: neither booked nor priced): one line that wraps, so a long route stays short. The way by land
// shows its icon and time (on phones only an arrow, so the towns fit two to a line); its name is for screen readers.
const TownChain = ({ towns }) => {
  const { texts, format } = useI18n();
  const labels = texts.multiCity;
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
      {towns.map((town, index) => {
        const LandIcon = town.land && LAND_ICONS[town.land.by];
        return (
          <Fragment key={`${town.ref}-${index}`}>
            <li className="flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="font-medium">{town.city}</span>{" "}
              <span className="text-muted-foreground">· {town.nights ? labels.nights(town.nights) : labels.passing}</span>
            </li>
            {town.land && (
              <li
                aria-label={labels.landLeg(format.duration(town.land.minutes), labels.land[town.land.by])}
                title={labels.landLeg(format.duration(town.land.minutes), labels.land[town.land.by])}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <span aria-hidden="true">→</span>
                {LandIcon && <LandIcon aria-hidden="true" className="size-3.5 max-sm:hidden" />}
                <span aria-hidden="true" className="max-sm:hidden">
                  {format.duration(town.land.minutes)}
                </span>
                <span aria-hidden="true" className="max-sm:hidden">
                  →
                </span>
              </li>
            )}
          </Fragment>
        );
      })}
    </ol>
  );
};

export default TownChain;
