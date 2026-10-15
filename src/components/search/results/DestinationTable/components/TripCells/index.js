"use client";

import { Moon, PlaneTakeoff } from "lucide-react";
import { useI18n } from "@/context/i18n";
import Pill from "@/components/search/results/DestinationTable/components/Pill";

// Travel dates and stay: "Fri 16 Oct → Mon 19 Oct" + "3 nights".
// Weekend trips add the times and the hours there; one way shows the departure (and arrival) time instead of the stay.
const TripCells = ({ fare, weekend }) => {
  const { texts, format } = useI18n();
  const dates = !fare.ret
    ? format.fmtDay(fare.day)
    : weekend
      ? `${format.fmtShort(fare.day)} ${fare.time} → ${format.fmtShort(fare.ret.day)} ${fare.ret.time}`
      : `${format.fmtDay(fare.day)} → ${format.fmtDay(fare.ret.day)}`;
  const showHours = fare.hours && fare.nights <= 3;

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 [grid-area:when] lg:contents">
      <span className="text-sm first-letter:uppercase lg:[grid-area:dates]">{dates}</span>
      <span className="lg:[grid-area:stay]">
        {fare.ret ? (
          <Pill icon={Moon}>
            {texts.units.nights(fare.nights)}
            {showHours && ` · ${fare.hours} h`}
          </Pill>
        ) : (
          fare.time && (
            <Pill icon={PlaneTakeoff}>
              {fare.time}
              {fare.arrive && ` → ${fare.arrive}`}
            </Pill>
          )
        )}
      </span>
    </span>
  );
};

export default TripCells;
