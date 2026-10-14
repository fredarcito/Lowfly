"use client";

import { Moon } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { cn } from "@/utils/cn";

// One figure: label above, value below
function Stat({ label, icon: Icon, strong, children }) {
  return (
    <div className="grid gap-0.5 md:px-4 md:first:pl-0 lg:px-5">
      <dt className="text-xs whitespace-nowrap text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "flex items-center gap-1.5 font-medium whitespace-nowrap first-letter:uppercase",
          strong && "font-heading text-lg font-extrabold tabular-nums"
        )}
      >
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {children}
      </dd>
    </div>
  );
}

// The trip in figures: departure, return and stay (or the departure time for one way) and the saved price.
// Phone: two columns. Tablet and up: one row with dividers.
export default function TripStats({ fare, className }) {
  const { t, f } = useI18n();
  return (
    <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-3 md:flex md:divide-x", className)}>
      <Stat label={t.trips.departure}>{f.fmtDay(fare.day)}</Stat>
      {fare.ret ? (
        <>
          <Stat label={t.trips.return}>{f.fmtDay(fare.ret.day)}</Stat>
          <Stat label={t.trips.stay} icon={Moon}>
            {t.units.nights(fare.nights)}
          </Stat>
        </>
      ) : (
        <Stat label={t.trips.departureTime}>{fare.time}</Stat>
      )}
      <Stat label={t.trips.savedPriceLabel} strong>
        {f.money(fare.price, fare.cur)}
      </Stat>
    </dl>
  );
}
