"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, ExternalLink, Plane, Search, Sparkles, Ticket, TicketsPlane, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AirlineBadge from "@/components/AirlineBadge";
import FareLegs from "@/components/FareLegs";
import Itinerary from "@/components/Itinerary";
import TopBar from "@/components/TopBar";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";
import { usePhoto } from "@/hooks/usePhoto";
import { daysUntil, isUpcoming, removeTrip, updateTrip } from "@/store/trips";
import { useTrips } from "@/hooks/useTrips";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

// "My trips" (/es/trips): the saved trips, or one of them with ?id=…
// One static page for both, since the trips only live in the browser.
export default function TripsApp() {
  const id = useSearchParams().get("id");
  const trips = useTrips();
  const trip = id && trips.find((saved) => saved.id === id);
  // The trips are only known in the browser: until then, show nothing rather than "no trips" for a moment
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <>
      <header className="bg-(image:--hero) px-4 pt-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-8 text-hero-foreground sm:px-6">
        <TopBar className="mx-auto max-w-5xl" />
      </header>
      <main className="mx-auto grid max-w-[calc(64rem+3rem)] gap-6 px-4 pt-2 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] sm:px-6">
        {!ready ? null : id ? trip ? <TripDetail trip={trip} /> : <NotFound /> : <TripList trips={trips} />}
      </main>
    </>
  );
}

function TripList({ trips }) {
  const { lang, t } = useI18n();
  const [showPast, setShowPast] = useState(false);
  const upcoming = trips.filter(isUpcoming);
  const past = trips.filter((saved) => !isUpcoming(saved)).reverse();

  return (
    <>
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{t.trips.title}</h1>
        <p className="text-muted-foreground">{t.trips.subtitle}</p>
      </div>

      {upcoming.length === 0 && (
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <TicketsPlane className="size-8 text-muted-foreground" />
          <p className="font-heading text-lg font-semibold">{t.trips.empty}</p>
          <p className="max-w-[48ch] text-sm text-muted-foreground">{t.trips.emptyHint}</p>
          <Button asChild className="mt-2">
            <Link href={ROUTES.home(lang)}>
              <Search /> {t.trips.findFlights}
            </Link>
          </Button>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <section className="grid gap-4">
          <button
            type="button"
            onClick={() => setShowPast((shown) => !shown)}
            aria-expanded={showPast}
            className="flex w-fit items-center gap-1.5 font-heading text-lg font-semibold"
          >
            {t.trips.past(past.length)}
            <ChevronDown className={cn("size-4 transition-transform", showPast && "rotate-180")} />
          </button>
          {showPast && (
            <div className="grid gap-4 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

// When the trip is: "in 9 days", "tomorrow", "you're on your trip"…
function useWhen(trip) {
  const { t } = useI18n();
  const days = daysUntil(trip);
  return days < 0 && isUpcoming(trip) ? t.trips.ongoing : t.trips.when(days);
}

function TripPhoto({ code, className, children }) {
  const photo = usePhoto(code);
  return (
    <div className={cn("relative overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]", className)}>
      {photo && <img src={photo.src} alt="" className="absolute inset-0 size-full object-cover" />}
      {photo === null && <Plane className="absolute inset-0 m-auto size-10 -rotate-45 text-white/30" />}
      {children}
    </div>
  );
}

function TripCard({ trip }) {
  const { lang, t, f } = useI18n();
  const when = useWhen(trip);
  const { fare } = trip;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg hover:ring-foreground/20">
      <TripPhoto code={fare.code} className="aspect-16/9">
        <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          {when}
        </span>
      </TripPhoto>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-heading text-lg leading-tight font-semibold">
          <Link
            href={ROUTES.trip(lang, trip.id)}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {fare.city}, <span className="font-normal text-muted-foreground">{fare.country}</span>
          </Link>
        </h2>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {fare.ret ? f.fmtRange(fare.day, fare.ret.day) : f.fmtDay(fare.day)} · {trip.origin} → {fare.code}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {airlinesOf(fare).map((airline) => (
            <AirlineBadge key={airline} airline={airline} />
          ))}
          {trip.itinerary && (
            <span className="flex items-center gap-1 rounded-full bg-selected px-2 py-0.5 text-xs font-medium text-primary-ink">
              <Sparkles className="size-3" /> {t.trips.itineraryReady}
            </span>
          )}
          {trip.booked && (
            <span className="flex items-center gap-1 rounded-full bg-save/15 px-2 py-0.5 text-xs font-medium text-save">
              <Ticket className="size-3" /> {t.trips.booked}
            </span>
          )}
          <span className="ml-auto font-heading text-lg font-extrabold tabular-nums">{f.money(fare.price, fare.cur)}</span>
        </div>
      </div>
    </article>
  );
}

function TripDetail({ trip }) {
  const { lang, t, f } = useI18n();
  const router = useRouter();
  const when = useWhen(trip);
  const { fare, origin } = trip;
  const remove = () => {
    if (!window.confirm(t.trips.removeConfirm)) return;
    router.replace(ROUTES.trips(lang));
    removeTrip(trip.id);
  };

  return (
    <>
      <Link href={ROUTES.trips(lang)} className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t.trips.back}
      </Link>

      <TripPhoto code={fare.code} className="grid min-h-48 items-end rounded-2xl sm:min-h-64">
        <div className="relative grid gap-1 bg-linear-to-t from-black/75 via-black/40 to-transparent p-5 pt-16 text-white sm:p-6 sm:pt-20">
          <span className="w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">{when}</span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            {fare.city}, <span className="font-semibold text-white/80">{fare.country}</span>
          </h1>
          <p className="text-white/85 first-letter:uppercase">{fare.ret ? f.fmtRange(fare.day, fare.ret.day) : f.fmtDay(fare.day)}</p>
        </div>
      </TripPhoto>

      <section className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-xl font-bold tracking-tight">{t.trips.flights}</h2>
          <span className="text-sm text-muted-foreground">{t.trips.savedPrice(f.money(fare.price, fare.cur))}</span>
        </div>
        <FareLegs fare={fare} origin={origin} />
        <p className="text-xs text-muted-foreground">{t.trips.priceMayChange}</p>
        <div className="flex flex-wrap items-center gap-2">
          {f.fareLinks(fare, origin).map((link) => (
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
              onChange={(event) => updateTrip(trip.id, { booked: event.target.checked })}
              className="size-4 accent-(--save)"
            />
            {t.trips.bookedQuestion}
          </label>
        </div>
      </section>

      <Itinerary trip={trip} />

      <Button variant="ghost" onClick={remove} className="justify-self-start text-muted-foreground hover:text-destructive">
        <Trash2 /> {t.trips.remove}
      </Button>
    </>
  );
}

function NotFound() {
  const { lang, t } = useI18n();
  return (
    <div className="grid justify-items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      <p className="text-muted-foreground">{t.trips.notFound}</p>
      <Button asChild variant="outline">
        <Link href={ROUTES.trips(lang)}>
          <ArrowLeft /> {t.trips.back}
        </Link>
      </Button>
    </div>
  );
}
