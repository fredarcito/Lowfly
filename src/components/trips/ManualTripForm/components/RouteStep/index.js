"use client";

import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldAlert from "@/components/shared/FieldAlert";
import StopCard from "@/components/trips/StopCard";
import { useI18n } from "@/context/i18n";
import { MAX_STOPS, MAX_TRIP_DAYS } from "@/constants/manualTrips";

// Step 1: the towns in order, each with when you arrive and leave (time optional). `form`: useManualTripForm;
// `onNext` checks them and goes on.
const RouteStep = ({ form, onNext }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;

  const submit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <ol className="grid gap-3">
        {form.stops.map((stop, index) => (
          <StopCard
            key={stop.key}
            stop={stop}
            number={index + 1}
            firstDay={form.stops[index - 1]?.leaveDay}
            problem={form.problemOf(index)}
            onChange={(changes) => form.change(stop.key, changes)}
            onRemove={form.stops.length > 1 ? () => form.remove(stop.key) : null}
          />
        ))}
      </ol>

      {form.stops.length < MAX_STOPS && (
        <Button type="button" variant="outline" onClick={form.add} className="h-11 w-full border-dashed font-semibold sm:w-fit sm:px-5">
          <Plus /> {labels.addStop}
        </Button>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="grid gap-0.5">
          <p className="font-medium">{labels.summary(form.stops.length, form.tripDays)}</p>
          <p className="text-sm text-muted-foreground">{labels.createHint}</p>
          {form.tooLong && <FieldAlert>{labels.errors.tooLong(MAX_TRIP_DAYS)}</FieldAlert>}
        </div>
        <Button type="submit" size="lg" className="h-11 shrink-0 px-6 text-base font-bold">
          {labels.next} <ArrowRight />
        </Button>
      </div>
    </form>
  );
};

export default RouteStep;
