"use client";

import { ChevronDown, ExternalLink, Info, Plane } from "lucide-react";
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
// coral actions. The chevron unfolds the flights (left) next to what is decided around booking (right): the
// extra baggage and "Booked the flights already?", with the saved price below. Phones: one under the other.
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
        <Plane className="size-5 shrink-0 -rotate-45 text-primary" strokeWidth={1.75} />
        <p className="min-w-0 flex-1">
          <span className="font-heading font-bold">{t.trips.flights}: </span>
          <span className="text-muted-foreground">
            {origin} {fare.ret ? "⇆" : "→"} {fare.code} · {airlines} ·{" "}
          </span>
          <span className="font-heading font-bold whitespace-nowrap tabular-nums">{f.money(fare.price, fare.cur)}</span>
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
        <div className="grid gap-5 border-t p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-0 lg:divide-x">
            <div className="lg:pr-6">
              <FareLegs fare={fare} origin={origin} legPrices={Boolean(fare.ret)} />
            </div>
            <div className="grid content-start gap-5 lg:pl-6">
              <BagEstimate fare={fare} large booked={trip.booked} />
              <label className="grid cursor-pointer grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 border-t pt-5">
                <input
                  type="checkbox"
                  checked={trip.booked}
                  onChange={(event) => setBooked(event.target.checked)}
                  className="mt-0.5 size-5 accent-(--save)"
                />
                <span className="font-medium">{t.trips.bookedQuestion}</span>
                <span className="col-start-2 text-sm text-muted-foreground">{t.trips.bookedHint}</span>
              </label>
            </div>
          </div>
          <p className="flex items-start gap-2 border-t pt-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            {t.trips.savedPrice(f.money(fare.price, fare.cur))}.{!trip.booked && ` ${t.trips.priceMayChange}`}
          </p>
        </div>
      </Collapse>
    </section>
  );
};

export default TripFlights;
