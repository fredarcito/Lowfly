"use client";

import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import PerPersonPrice from "@/components/shared/PerPersonPrice";
import { useI18n } from "@/context/i18n";
import { useLegEnds } from "@/hooks/useLegEnds";
import { AIRLINES } from "@/utils/format";

// The trip's two flights at a glance, one line each: out and back, where from and to, the day and time, the airline
// and its price (every detail and "Buy" are in the folded flights below)
const FlightPair = ({ trip }) => {
  const { texts, format } = useI18n();
  const ends = useLegEnds(trip.legs);
  const ways = [
    { icon: PlaneTakeoff, label: texts.results.out },
    { icon: PlaneLanding, label: texts.results.ret },
  ];
  return (
    <ul className="grid gap-1.5 text-sm">
      {trip.legs.map((leg, index) => {
        const { icon: Icon, label } = ways[index];
        return (
          <li key={`${leg.from}-${leg.to}-${leg.day}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-2">
            <Icon aria-hidden="true" className="size-4 translate-y-0.5 text-muted-foreground" />
            <span className="min-w-0">
              <span className="sr-only">{label}: </span>
              <span className="font-medium">
                {ends[index].from.city} → {ends[index].to.city}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · {format.fmtDay(leg.day)}
                {leg.time && `, ${leg.time}`} · {AIRLINES[leg.airline]}
              </span>
            </span>
            <span className="grid justify-items-end">
              <span className="font-medium tabular-nums">{format.money(format.forGroup(leg.price), leg.cur)}</span>
              <PerPersonPrice price={leg.price} cur={leg.cur} className="text-xs" />
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default FlightPair;
