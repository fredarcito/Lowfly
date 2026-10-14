"use client";

import { ChevronDown, ExternalLink, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import Collapse from "@/components/shared/Collapse";
import BagEstimate from "@/components/shared/BagEstimate";
import FareLegs from "@/components/shared/FareLegs";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useTripActions } from "@/hooks/useTripActions";
import { AIRLINES, airlinesOf } from "@/utils/format";
import { cn } from "@/utils/cn";

// The trip's flights as a slim bar: "MLA ⇆ BRI · Ryanair · €29.98".
// Not booked yet: the booking buttons stay in sight, outlined so they do not compete with the itinerary's
// coral actions. The chevron unfolds each leg and "Booked already?".
const TripFlights = ({ trip }) => {
  const { t, f } = useI18n();
  const { setBooked, bookingLinks } = useTripActions(trip);
  const details = useDisclosure();
  const { fare, origin } = trip;
  const airlines = airlinesOf(fare)
    .map((airline) => AIRLINES[airline])
    .join(" + ");

  return (
    <section className="rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-5">
        <Plane className="size-5 shrink-0 -rotate-45 text-muted-foreground" strokeWidth={1.75} />
        <p className="min-w-0 flex-1">
          <span className="font-heading font-bold">{t.trips.flights}: </span>
          <span className="text-muted-foreground">
            {origin} {fare.ret ? "⇆" : "→"} {fare.code} · {airlines} · {f.money(fare.price, fare.cur)}
          </span>
        </p>
        {!trip.booked && (
          <div className="flex flex-wrap gap-2 max-sm:order-last max-sm:w-full">
            {bookingLinks.map((link) => (
              <Button key={link.href} asChild variant="outline" className="h-9 font-semibold max-sm:flex-1">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label} <ExternalLink />
                </a>
              </Button>
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={details.toggle}
          aria-expanded={details.open}
          aria-label={details.open ? t.trips.hideFlights : t.trips.showFlights}
          className="size-9"
        >
          <ChevronDown className={cn("transition-transform", details.open && "rotate-180")} />
        </Button>
      </div>

      <Collapse open={details.open}>
        <div className="grid gap-4 border-t p-4 sm:p-5">
          <FareLegs fare={fare} origin={origin} />
          <BagEstimate fare={fare} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {t.trips.savedPrice(f.money(fare.price, fare.cur))}. {t.trips.priceMayChange}
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm" title={t.trips.bookedHint}>
              <input
                type="checkbox"
                checked={trip.booked}
                onChange={(event) => setBooked(event.target.checked)}
                className="size-4 accent-(--save)"
              />
              {t.trips.bookedQuestion}
            </label>
          </div>
        </div>
      </Collapse>
    </section>
  );
};

export default TripFlights;
