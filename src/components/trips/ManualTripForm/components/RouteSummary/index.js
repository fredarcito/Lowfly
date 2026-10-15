"use client";

import { CalendarDays, Map, MapPin, Moon } from "lucide-react";
import FieldAlert from "@/components/shared/FieldAlert";
import SummaryRow from "@/components/trips/ManualTripForm/components/RouteSummary/components/SummaryRow";
import { useI18n } from "@/context/i18n";
import { MAX_TRIP_DAYS } from "@/constants/manualTrips";

// Desktop, beside each step and following the scroll: the trip so far in four lines (the towns, the dates, how
// many towns, how long), and below, in a card of its own, the step's actions (`children`). It belongs to the
// whole wizard: it fades in when the wizard opens and stays from step to step. `form`: useManualTripForm.
const RouteSummary = ({ form, children }) => {
  const { texts, format } = useI18n();
  const labels = texts.trips.manual;
  const towns = form.stops.map((stop) => stop.place?.name).filter(Boolean).join(" → ");
  const firstDay = form.stops[0].arriveDay;
  const lastDay = form.stops.at(-1).leaveDay;
  const dates = firstDay && lastDay ? format.fmtRange(firstDay, lastDay) : null;
  const days = form.tripDays;

  return (
    <aside className="sticky top-6 grid gap-4 self-start duration-500 animate-in fade-in motion-reduce:animate-none max-lg:hidden">
      <section className="grid gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="grid gap-1">
          <h2 className="font-heading text-xl font-bold tracking-tight">{labels.summaryTitle}</h2>
          <p className="text-sm text-muted-foreground">{labels.summaryHint}</p>
        </div>
        <ul className="grid gap-4">
          <SummaryRow icon={MapPin} valueKey={towns || "none"} muted={!towns}>
            {towns || texts.trips.route}
          </SummaryRow>
          <SummaryRow icon={CalendarDays} valueKey={dates ?? "none"} muted={!dates}>
            {dates ?? labels.noDatesYet}
          </SummaryRow>
          <SummaryRow icon={Map} valueKey={form.stops.length}>
            {texts.trips.townsCount(form.stops.length)}
          </SummaryRow>
          <SummaryRow icon={Moon} valueKey={days ?? "none"} muted={!days}>
            {days ? labels.stayLength(days, days - 1) : "—"}
          </SummaryRow>
        </ul>
        {form.tooLong && <FieldAlert>{labels.errors.tooLong(MAX_TRIP_DAYS)}</FieldAlert>}
      </section>

      <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">{children}</section>
    </aside>
  );
};

export default RouteSummary;
