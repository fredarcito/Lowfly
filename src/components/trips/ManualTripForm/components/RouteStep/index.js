"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldAlert from "@/components/shared/FieldAlert";
import StopCard from "@/components/trips/ManualTripForm/components/RouteStep/components/StopCard";
import { useI18n } from "@/context/i18n";
import { ROUTE_FORM_ID } from "@/components/trips/ManualTripForm/resources/formIds";
import { MAX_STOPS, MAX_TRIP_DAYS } from "@/constants/manualTrips";
import { cn } from "@/utils/cn";

// Step 1: the towns in order, each with when you arrive and leave (times optional). Its "Continue" is the
// wizard's (summary and bottom bar), which submits this form by its id. `form`: useManualTripForm; `onNext`
// checks the towns and goes on; `enterClassName`: how the column arrives.
const RouteStep = ({ form, onNext, enterClassName }) => {
  const { texts } = useI18n();
  const labels = texts.trips.manual;

  const submit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form id={ROUTE_FORM_ID} onSubmit={submit} noValidate className={cn("grid gap-4", enterClassName)}>
      <section className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <div className="grid gap-1">
          <h2 className="font-heading text-xl font-bold tracking-tight">{texts.trips.route}</h2>
          <p className="text-sm text-muted-foreground">{labels.routeHint}</p>
        </div>
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
              justAdded={stop.key === form.addedKey}
            />
          ))}
        </ol>
      </section>

      {form.stops.length < MAX_STOPS && (
        <Button type="button" variant="outline" onClick={form.add} className="h-12 w-full border-dashed font-semibold transition-colors sm:w-fit sm:px-6">
          <Plus /> {labels.addStop}
        </Button>
      )}

      {/* Desktop says it in the summary */}
      {form.tooLong && <FieldAlert className="lg:hidden">{labels.errors.tooLong(MAX_TRIP_DAYS)}</FieldAlert>}
    </form>
  );
};

export default RouteStep;
