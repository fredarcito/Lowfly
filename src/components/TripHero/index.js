"use client";

import TripPhoto from "@/components/TripPhoto";
import { useI18n } from "@/context/i18n";
import { useTripWhen } from "@/hooks/useTripWhen";

// Top of a trip: the destination photo with when, where and the dates over it
export default function TripHero({ trip }) {
  const { f } = useI18n();
  const when = useTripWhen(trip);
  const { fare } = trip;
  return (
    <TripPhoto code={fare.code} className="grid min-h-48 items-end rounded-2xl sm:min-h-64">
      <div className="relative grid gap-1 bg-linear-to-t from-black/75 via-black/40 to-transparent p-5 pt-16 text-white sm:p-6 sm:pt-20">
        <span className="w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">{when}</span>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          {fare.city}, <span className="font-semibold text-white/80">{fare.country}</span>
        </h1>
        <p className="text-white/85 first-letter:uppercase">{fare.ret ? f.fmtRange(fare.day, fare.ret.day) : f.fmtDay(fare.day)}</p>
      </div>
    </TripPhoto>
  );
}
