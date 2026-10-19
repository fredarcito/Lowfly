"use client";

import { ArrowRight, BedDouble, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { useLegEnds } from "@/hooks/useLegEnds";
import { directionsOf } from "@/utils/stopovers";

// The trip at a glance, without its flights: the way there and back through their cities (Malta → Zagreb →
// Basilea, with the nights at each city on the way: "Roma · 2 noches"), what a stop on the way there is when it is not a
// visit (a connection's time, a long stop's night and hours), and every night of the trip in order (6 nights: 2 in
// Rome and 4 in Tirana). A visit has its own box (EscapadaBox).
const WaySummary = ({ trip }) => {
  const { texts, format } = useI18n();
  const { out, back } = directionsOf(trip);
  const outEnds = useLegEnds(out.legs);
  const backEnds = useLegEnds(back?.legs ?? []);
  const results = texts.results;

  const connectionText = (stop) => {
    if (stop?.type === "connection") return stop.minutes ? results.connectionIn(format.duration(stop.minutes), stop.city) : results.stopIn(stop.city);
    if (stop?.type !== "layover") return null;
    const [landing, leaving] = out.legs;
    const land = landing.arrive && `${format.fmtDay(landing.day)} ${landing.arrive}`;
    const leave = `${format.fmtDay(leaving.day)} ${leaving.time}`;
    return [results.longStopIn(stop.city, stop.nights), land && results.landLeave(land, leave)].filter(Boolean).join(" · ");
  };
  // Every night of the trip, in order (the hub, the destination, the way back): "6 nights: 2 in Rome and 4 in Tirana"
  const arrival = trip.legs.findIndex((leg) => leg.to === trip.code);
  const nights = trip.stops.map((stop, index) => ({ ...stop, back: index > arrival })).filter((stop) => stop.nights > 0);
  const total = nights.reduce((sum, stop) => sum + stop.nights, 0);
  const backStop = back?.stops[0];
  const stay = [
    nights.length > 1
      ? results.tripNights(total, nights.map((stop) => results.nightsPart(stop.nights, stop.city, stop.back)))
      : nights[0] && results.nightsIn(nights[0].nights, nights[0].city),
    backStop?.nights === 0 && results.backWithStop(backStop.city),
  ].filter(Boolean);
  const ways = [
    { key: "out", icon: PlaneTakeoff, label: results.out, ends: outEnds, stops: out.stops, note: connectionText(out.stops[0]) },
    ...(back ? [{ key: "back", icon: PlaneLanding, label: results.ret, ends: backEnds, stops: back.stops, note: null }] : []),
  ];

  return (
    <div className="grid gap-3">
      {ways.map(({ key, icon: Icon, label, ends, stops, note }) => (
        <div key={key} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[1.25rem_5rem_minmax(0,1fr)]">
          <Icon className="mt-0.5 size-5 text-muted-foreground" />
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase max-sm:hidden sm:mt-1">{label}</span>
          <div className="grid gap-0.5">
            <p className="flex flex-wrap items-center gap-x-2 font-heading text-lg font-semibold">
              {[ends[0]?.from, ...ends.map((end) => end.to)].map((airport, index) => (
                <span key={`${airport?.code}-${index}`} className="flex items-center gap-x-2">
                  {index > 0 && <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
                  {airport?.city ?? airport?.code}
                  {/* A city of the way with nights there: how many, next to it */}
                  {stops[index - 1]?.nights > 0 && index < ends.length && (
                    <span className="font-sans text-sm font-normal text-muted-foreground">· {texts.units.nights(stops[index - 1].nights)}</span>
                  )}
                </span>
              ))}
            </p>
            {note && <p className="text-sm text-muted-foreground">{note}</p>}
          </div>
        </div>
      ))}
      {stay.length > 0 && (
        <p className="flex items-center gap-3 border-t pt-3 text-sm text-muted-foreground">
          <BedDouble className="size-5 shrink-0" />
          {stay.join(" · ")}
        </p>
      )}
    </div>
  );
};

export default WaySummary;
