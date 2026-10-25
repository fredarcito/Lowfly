"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangeField from "@/components/search/DateRangeField";
import Collapse from "@/components/shared/Collapse";
import FieldAlert from "@/components/shared/FieldAlert";
import FormField from "@/components/shared/FormField";
import CityField from "@/components/trips/CityField";
import StopTimes from "@/components/trips/ManualTripForm/components/RouteStep/components/StopCard/components/StopTimes";
import StopPlaces from "@/components/trips/ManualTripForm/components/RouteStep/components/StopCard/components/StopPlaces";
import { useFocusWhenAdded } from "@/components/trips/ManualTripForm/components/RouteStep/components/StopCard/hooks/useFocusWhenAdded";
import { useLeaving } from "@/hooks/useLeaving";
import { useI18n } from "@/context/i18n";
import { nightsBetween } from "@/utils/dates";
import { cn } from "@/utils/cn";

// One town of a trip planned by hand: its number and name, the town, arrival and departure (from the day the
// previous town is left; both in one calendar), how long the stay is, the optional times and places to visit for
// sure, and what has to be fixed. It arrives sliding up and, removed, folds away. `onChange(changes)`; `onRemove` only when there are
// other towns. The towns go in the order of their dates (each starts where the previous one ends).
// `justAdded`: it was just added, so it scrolls into view with the cursor in its town search.
const StopCard = ({ stop, number, firstDay, problem, onChange, onRemove, justAdded = false }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  const { leaving, leave } = useLeaving(onRemove);
  const cardRef = useFocusWhenAdded(justAdded);
  const id = `stop-${stop.key}`;
  const nights = stop.arriveDay && stop.leaveDay ? nightsBetween(stop.arriveDay, stop.leaveDay) : null;
  // The town whose places were removed by changing it (they were searched around it)
  const [cleared, setCleared] = useState(null);

  const changeTown = (place) => {
    if (stop.mustVisit.length && place?.name !== stop.place?.name) {
      setCleared(stop.place?.name ?? null);
      onChange({ place, mustVisit: [] });
    } else onChange({ place });
  };

  return (
    <li ref={cardRef} className="scroll-mt-24 duration-300 ease-out animate-in fade-in slide-in-from-bottom-3 motion-reduce:animate-none">
      <Collapse open={!leaving}>
        <div className={cn("grid grid-cols-1 gap-4 rounded-xl bg-background/40 p-4 ring-1 ring-foreground/10 transition-opacity duration-300 sm:p-5", leaving && "opacity-0")}>
          <div className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">{number}</span>
            <p key={stop.place?.name ?? "empty"} className="min-w-0 flex-1 truncate font-heading text-lg font-bold duration-300 animate-in fade-in motion-reduce:animate-none">
              {stop.place?.name ?? labels.stopN(number)}
            </p>
            {onRemove && (
              <Button type="button" variant="outline" size="icon" onClick={leave} aria-label={labels.removeStop} className="size-9 shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 />
              </Button>
            )}
          </div>

          <FormField id={`${id}-city`} label={labels.city}>
            <CityField id={`${id}-city`} value={stop.place} onChange={changeTown} invalid={problem === "city"} />
          </FormField>

          <div className="grid grid-cols-1 gap-2">
            <DateRangeField
              id={`${id}-dates`}
              split
              unit="nights"
              from={stop.arriveDay}
              to={stop.leaveDay}
              minDay={firstDay || undefined}
              labels={{ start: labels.arrival, end: labels.departure, pickStart: labels.pickArrival, pickEnd: labels.pickDeparture }}
              onChange={(arriveDay, leaveDay) => onChange({ arriveDay, leaveDay })}
            />
            {nights !== null && (
              <p key={nights} className="text-sm text-muted-foreground duration-300 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none">
                {labels.stayLength(nights + 1, nights)}
              </p>
            )}
          </div>

          <StopTimes id={id} arriveTime={stop.arriveTime} leaveTime={stop.leaveTime} onChange={onChange} />
          <StopPlaces
            id={id}
            place={stop.place}
            places={stop.mustVisit}
            days={nights === null ? 1 : nights + 1}
            cleared={cleared}
            onChange={(mustVisit) => onChange({ mustVisit })}
          />

          {problem && (
            <FieldAlert className="duration-300 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none">{labels.errors[problem]}</FieldAlert>
          )}
        </div>
      </Collapse>
    </li>
  );
};

export default StopCard;
