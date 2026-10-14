"use client";

import { Luggage } from "lucide-react";
import { useI18n } from "@/context/i18n";
import { BAGS } from "@/constants/baggage";
import { bagExtra } from "@/utils/baggage";
import { airlineNames } from "@/utils/format";
import { cn } from "@/utils/cn";

// What a bag adds to a fare, so its real cost is no surprise when booking (the fares only include a small
// bag under the seat): "Estimated extra baggage · Cabin 10 kg +€12 · Checked 20 kg +€21", for both flights
// on a return trip, and where the final price is. The hint says they are estimates.
const BagEstimate = ({ fare, className }) => {
  const { t, f } = useI18n();
  const extras = Object.keys(BAGS)
    .map((kind) => ({ kind, extra: bagExtra(fare, kind) }))
    .filter((estimate) => estimate.extra != null);
  if (!extras.length) return null;
  const wholeEuros = (amount) => f.money(Math.round(amount), fare.cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className={cn("grid content-start gap-1 text-sm text-muted-foreground", className)} title={t.results.bagsHint}>
      <p className="flex items-center gap-1.5 text-foreground">
        <Luggage className="size-4 shrink-0 text-muted-foreground" />
        {t.results.bagsTitle}
      </p>
      <dl className="grid max-w-72 grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 pl-5.5">
        {extras.map(({ kind, extra }) => (
          <div key={kind} className="contents">
            <dt className="whitespace-nowrap">{t.results.bag[kind](BAGS[kind].kg)}</dt>
            <dd className="text-right font-medium whitespace-nowrap text-foreground tabular-nums">+{wholeEuros(extra)}</dd>
          </div>
        ))}
      </dl>
      <p className="pl-5.5 text-xs">
        {fare.ret && `${t.results.bagsBothFlights} `}
        {t.results.bagsFinalPrice(airlineNames(fare))}
      </p>
      <span className="sr-only">{t.results.bagsHint}</span>
    </div>
  );
};

export default BagEstimate;
