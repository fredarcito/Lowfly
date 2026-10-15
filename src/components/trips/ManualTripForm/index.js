"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldAlert from "@/components/shared/FieldAlert";
import StopCard from "@/components/trips/StopCard";
import { useI18n } from "@/context/i18n";
import { useManualTripForm } from "@/hooks/useManualTripForm";
import { MAX_STOPS, MAX_TRIP_DAYS } from "@/constants/manualTrips";
import { ROUTES } from "@/constants/routes";

// Planning a trip by hand: the towns in order, each with when you arrive and leave (time optional).
// Creating it saves the trip and opens it, where the visitor picks the pace and interests and the AI
// plans the whole route. The towns and their checks live in useManualTripForm.
const ManualTripForm = () => {
  const { lang, texts } = useI18n();
  const router = useRouter();
  const trip = useManualTripForm();
  const labels = texts.trips.manual;

  const create = (event) => {
    event.preventDefault();
    const id = trip.create();
    if (id) router.push(ROUTES.trip(lang, id));
  };

  return (
    <>
      <Link href={ROUTES.trips(lang)} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {texts.trips.backToList}
      </Link>
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.title}</h1>
        <p className="max-w-[60ch] text-muted-foreground sm:text-lg">{labels.subtitle}</p>
      </div>

      <form onSubmit={create} noValidate className="grid gap-4">
        <ol className="grid gap-3">
          {trip.stops.map((stop, index) => (
            <StopCard
              key={stop.key}
              stop={stop}
              number={index + 1}
              firstDay={trip.stops[index - 1]?.leaveDay}
              problem={trip.problemOf(index)}
              onChange={(changes) => trip.change(stop.key, changes)}
              onRemove={trip.stops.length > 1 ? () => trip.remove(stop.key) : null}
            />
          ))}
        </ol>

        {trip.stops.length < MAX_STOPS && (
          <Button type="button" variant="outline" onClick={trip.add} className="h-11 w-full border-dashed font-semibold sm:w-fit sm:px-5">
            <Plus /> {labels.addStop}
          </Button>
        )}

        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="grid gap-0.5">
            <p className="font-medium">{labels.summary(trip.stops.length, trip.tripDays)}</p>
            <p className="text-sm text-muted-foreground">{labels.createHint}</p>
            {trip.tooLong && <FieldAlert>{labels.errors.tooLong(MAX_TRIP_DAYS)}</FieldAlert>}
          </div>
          <Button type="submit" size="lg" className="h-11 shrink-0 px-6 text-base font-bold">
            <Sparkles /> {labels.create}
          </Button>
        </div>
      </form>
    </>
  );
};

export default ManualTripForm;
