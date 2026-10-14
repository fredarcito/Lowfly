"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import FareLegs from "@/components/FareLegs";
import { useI18n } from "@/context/i18n";
import { useTripActions } from "@/hooks/useTripActions";

// The trip's flights: each leg, the saved price, the booking links and "Booked already?"
export default function TripFlights({ trip }) {
  const { t, f } = useI18n();
  const { setBooked, bookingLinks } = useTripActions(trip);
  const { fare, origin } = trip;
  return (
    <section className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-bold tracking-tight">{t.trips.flights}</h2>
        <span className="text-sm text-muted-foreground">{t.trips.savedPrice(f.money(fare.price, fare.cur))}</span>
      </div>
      <FareLegs fare={fare} origin={origin} />
      <p className="text-xs text-muted-foreground">{t.trips.priceMayChange}</p>
      <div className="flex flex-wrap items-center gap-2">
        {bookingLinks.map((link) => (
          <Button key={link.href} asChild className="h-10 font-bold">
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} <ExternalLink />
            </a>
          </Button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm" title={t.trips.bookedHint}>
          <input
            type="checkbox"
            checked={trip.booked}
            onChange={(event) => setBooked(event.target.checked)}
            className="size-4 accent-(--save)"
          />
          {t.trips.bookedQuestion}
        </label>
      </div>
    </section>
  );
}
