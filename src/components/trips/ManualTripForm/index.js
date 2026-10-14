"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleAlert, LogIn, LogOut, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DateRangeField from "@/components/search/DateRangeField";
import CityField from "@/components/trips/CityField";
import PreferencePicker from "@/components/trips/itinerary/PreferencePicker";
import { useI18n } from "@/context/i18n";
import { saveManualTrip } from "@/store/trips";
import { daysBetween } from "@/utils/dates";
import { MAX_STOPS, MAX_TRIP_DAYS } from "@/constants/manualTrips";
import { ROUTES } from "@/constants/routes";

// "2026-11-13" + "10:00" → comparable text; without a time, the day alone
const momentOf = (day, time) => `${day}T${time || "00:00"}`;

// What is wrong with each town (a key of t.trips.manual.errors, or null), and with the trip as a whole
const problemsOf = (stops) => {
  const each = stops.map((stop, index) => {
    if (!stop.place) return "city";
    if (!stop.arriveDay || !stop.leaveDay) return "dates";
    if (momentOf(stop.leaveDay, stop.leaveTime) < momentOf(stop.arriveDay, stop.arriveTime)) return "leaveBeforeArrive";
    const previous = stops[index - 1];
    if (previous?.leaveDay && momentOf(stop.arriveDay, stop.arriveTime) < momentOf(previous.leaveDay, previous.leaveTime)) return "overlap";
    return null;
  });
  const first = stops[0].arriveDay;
  const last = stops.at(-1).leaveDay;
  const tooLong = first && last && last >= first && daysBetween(first, last).length > MAX_TRIP_DAYS;
  return { each, tooLong };
};

// Times to pick for an arrival or a departure, every half hour from 06:00 (the small hours go last, so the
// usual ones show first); "none" plans the whole day
const NO_TIME = "none";
const FIRST_HOUR = 6;
const TIMES = Array.from({ length: 48 }, (_, index) => {
  const hour = (Math.floor(index / 2) + FIRST_HOUR) % 24;
  return `${String(hour).padStart(2, "0")}:${index % 2 ? "30" : "00"}`;
});

// Planning a trip by hand: the towns in order, each with when you arrive and leave (time optional).
// Creating it saves the trip and opens it, where the visitor picks the pace and interests and the AI
// plans the whole route.
const ManualTripForm = () => {
  const { lang, t } = useI18n();
  const router = useRouter();
  const nextKey = useRef(1);
  const newStop = (arriveDay = "") => ({ key: nextKey.current++, place: null, arriveDay, arriveTime: "", leaveDay: "", leaveTime: "" });
  const [stops, setStops] = useState(() => [newStop()]);
  const [submitted, setSubmitted] = useState(false);
  const labels = t.trips.manual;
  const timeOptions = [{ id: NO_TIME, label: labels.noTime }, ...TIMES.map((time) => ({ id: time, label: time }))];

  const { each, tooLong } = problemsOf(stops);
  const valid = !tooLong && each.every((problem) => !problem);
  const firstDay = stops[0].arriveDay;
  const lastDay = stops.at(-1).leaveDay;
  const tripDays = firstDay && lastDay && lastDay >= firstDay ? daysBetween(firstDay, lastDay).length : null;

  const change = (key, changes) => setStops((current) => current.map((stop) => (stop.key === key ? { ...stop, ...changes } : stop)));
  const remove = (key) => setStops((current) => current.filter((stop) => stop.key !== key));
  // The next town starts the day you leave the last one
  const add = () => setStops((current) => [...current, newStop(current.at(-1).leaveDay)]);

  const create = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    const id = saveManualTrip(
      stops.map(({ place, arriveDay, arriveTime, leaveDay, leaveTime }) => ({
        city: place.name,
        region: place.region,
        country: place.country,
        countryCode: place.countryCode,
        lat: place.lat,
        lng: place.lng,
        code: place.code,
        arrive: { day: arriveDay, time: arriveTime || null },
        leave: { day: leaveDay, time: leaveTime || null },
      }))
    );
    router.push(ROUTES.trip(lang, id));
  };

  return (
    <>
      <Link href={ROUTES.trips(lang)} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t.trips.backToList}
      </Link>
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{labels.title}</h1>
        <p className="max-w-[60ch] text-muted-foreground sm:text-lg">{labels.subtitle}</p>
      </div>

      <form onSubmit={create} noValidate className="grid gap-4">
        <ol className="grid gap-3">
          {stops.map((stop, index) => {
            const problem = submitted ? each[index] : null;
            const id = `stop-${stop.key}`;
            return (
              <li key={stop.key} className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2.5 font-heading font-bold">
                    <span className="grid size-7 place-items-center rounded-full bg-primary text-sm text-primary-foreground">{index + 1}</span>
                    {stop.place?.name ?? labels.stopN(index + 1)}
                  </p>
                  {stops.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(stop.key)} className="text-muted-foreground">
                      <Trash2 /> <span className="max-sm:sr-only">{labels.removeStop}</span>
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,1.5fr)]">
                  <div className="grid min-w-0 grid-cols-1 content-start gap-1.5">
                    <Label htmlFor={`${id}-city`} className="text-muted-foreground">
                      {labels.city}
                    </Label>
                    <CityField id={`${id}-city`} value={stop.place} onChange={(place) => change(stop.key, { place })} invalid={problem === "city"} />
                  </div>
                  <div className="grid min-w-0 grid-cols-1 content-start gap-1.5">
                    <Label htmlFor={`${id}-dates`} className="text-muted-foreground">
                      {labels.dates}
                    </Label>
                    <DateRangeField
                      id={`${id}-dates`}
                      unit="nights"
                      from={stop.arriveDay}
                      to={stop.leaveDay}
                      minDay={stops[index - 1]?.leaveDay || undefined}
                      labels={{ start: labels.arrival, end: labels.departure, pickStart: labels.pickArrival, pickEnd: labels.pickDeparture }}
                      onChange={(arriveDay, leaveDay) => change(stop.key, { arriveDay, leaveDay })}
                    />
                  </div>
                  {/* The two times side by side, also on phones */}
                  <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1">
                    <PreferencePicker
                      id={`${id}-arrive-time`}
                      icon={LogIn}
                      label={labels.arrivalTime}
                      options={timeOptions}
                      value={stop.arriveTime || NO_TIME}
                      onChange={(time) => change(stop.key, { arriveTime: time === NO_TIME ? "" : time })}
                    />
                    <PreferencePicker
                      id={`${id}-leave-time`}
                      icon={LogOut}
                      label={labels.departureTime}
                      options={timeOptions}
                      value={stop.leaveTime || NO_TIME}
                      onChange={(time) => change(stop.key, { leaveTime: time === NO_TIME ? "" : time })}
                    />
                  </div>
                </div>

                {problem && (
                  <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
                    <CircleAlert className="size-4 shrink-0" /> {labels.errors[problem]}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {stops.length < MAX_STOPS && (
          <Button type="button" variant="outline" onClick={add} className="h-11 w-full border-dashed font-semibold sm:w-fit sm:px-5">
            <Plus /> {labels.addStop}
          </Button>
        )}

        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="grid gap-0.5">
            <p className="font-medium">
              {labels.summary(stops.length, tripDays)}
            </p>
            <p className="text-sm text-muted-foreground">{labels.createHint}</p>
            {submitted && tooLong && (
              <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
                <CircleAlert className="size-4 shrink-0" /> {labels.errors.tooLong(MAX_TRIP_DAYS)}
              </p>
            )}
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
