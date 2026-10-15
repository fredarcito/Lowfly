"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangeField from "@/components/search/DateRangeField";
import FieldAlert from "@/components/shared/FieldAlert";
import FormField from "@/components/shared/FormField";
import CityField from "@/components/trips/CityField";
import StopTimes from "@/components/trips/StopTimes";
import { useI18n } from "@/context/i18n";

// One town of a trip planned by hand: its number and name, the town, its dates (from the day the previous town
// is left), the arrival and departure times, and what has to be fixed. `onChange(changes)`, `onRemove` (only
// when there are other towns).
const StopCard = ({ stop, number, firstDay, problem, onChange, onRemove }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;
  const id = `stop-${stop.key}`;
  return (
    <li className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-heading font-bold">
          <span className="grid size-7 place-items-center rounded-full bg-primary text-sm text-primary-foreground">{number}</span>
          {stop.place?.name ?? labels.stopN(number)}
        </p>
        {onRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-muted-foreground">
            <Trash2 /> <span className="max-sm:sr-only">{labels.removeStop}</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,1.5fr)]">
        <FormField id={`${id}-city`} label={labels.city}>
          <CityField id={`${id}-city`} value={stop.place} onChange={(place) => onChange({ place })} invalid={problem === "city"} />
        </FormField>
        <FormField id={`${id}-dates`} label={labels.dates}>
          <DateRangeField
            id={`${id}-dates`}
            unit="nights"
            from={stop.arriveDay}
            to={stop.leaveDay}
            minDay={firstDay || undefined}
            labels={{ start: labels.arrival, end: labels.departure, pickStart: labels.pickArrival, pickEnd: labels.pickDeparture }}
            onChange={(arriveDay, leaveDay) => onChange({ arriveDay, leaveDay })}
          />
        </FormField>
        <StopTimes id={id} arriveTime={stop.arriveTime} leaveTime={stop.leaveTime} onChange={onChange} />
      </div>

      {problem && <FieldAlert>{labels.errors[problem]}</FieldAlert>}
    </li>
  );
};

export default StopCard;
