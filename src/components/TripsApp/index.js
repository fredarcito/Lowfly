"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Bookmark,
  ChevronDown,
  Clock,
  Ellipsis,
  ExternalLink,
  Luggage,
  Moon,
  Plane,
  PlaneTakeoff,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AirlineBadge from "@/components/AirlineBadge";
import FareLegs from "@/components/FareLegs";
import DeleteTripDialog from "@/components/DeleteTripDialog";
import Itinerary from "@/components/Itinerary";
import TopBar from "@/components/TopBar";
import { useI18n } from "@/context/i18n";
import { airlinesOf } from "@/utils/format";
import { findAirport, useAirports } from "@/hooks/useAirports";
import { usePhoto } from "@/hooks/usePhoto";
import { daysUntil, isUpcoming, updateTrip } from "@/store/trips";
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
        <p className="text-muted-foreground sm:text-lg">{t.trips.subtitle}</p>
      </div>

      {upcoming.length === 0 ? (
        <EmptyTrips />
      ) : (
        <div className="grid gap-3">
          {upcoming.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
          <Link
            href={ROUTES.home(lang)}
            className="flex w-fit items-center gap-3 rounded-full py-1 pr-3 font-medium text-primary-ink hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span className="grid size-9 place-items-center rounded-full ring-1 ring-primary-ink/60">
              <Plus className="size-4" />
            </span>
            {t.trips.exploreMore}
          </Link>
        </div>
      )}

      {past.length > 0 && (
        <section className="grid gap-3 border-t pt-6">
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
            <div className="grid gap-3 opacity-80">
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

// No upcoming trips: a small illustration (suitcase and plane) and the way to find one
function EmptyTrips() {
  const { lang, t } = useI18n();
  return (
    <div className="grid items-center justify-items-center gap-6 rounded-xl bg-card px-6 py-10 text-center ring-1 ring-foreground/10 sm:grid-cols-[auto_auto] sm:justify-center sm:gap-10 sm:text-left">
      <div aria-hidden className="relative px-6 pt-4">
        <Luggage className="size-20 text-muted-foreground" strokeWidth={1.1} />
        <Plane className="absolute top-0 -right-1 size-7 text-primary" />
        <span className="absolute top-6 right-4 h-8 w-6 rounded-tr-full border-t-2 border-r-2 border-dashed border-muted-foreground/50" />
      </div>
      <div className="grid justify-items-center gap-2 sm:justify-items-start sm:border-l sm:pl-10">
        <p className="font-heading text-xl font-bold">{t.trips.empty}</p>
        <p className="max-w-[44ch] text-sm text-muted-foreground">{t.trips.emptyHint}</p>
        <Button asChild variant="outline" className="mt-2 h-10 rounded-full px-5 font-semibold">
          <Link href={ROUTES.home(lang)}>
            <PlaneTakeoff /> {t.trips.exploreFlights}
          </Link>
        </Button>
      </div>
    </div>
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
    <div
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(135deg,var(--sea),color-mix(in_oklab,var(--primary)_70%,var(--sea)))]",
        className,
      )}
    >
      {photo && <img src={photo.src} alt="" className="absolute inset-0 size-full object-cover" />}
      {photo === null && <Plane className="absolute inset-0 m-auto size-10 -rotate-45 text-white/30" />}
      {children}
    </div>
  );
}

function Chip({ icon: Icon, className, children }) {
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium", className)}>
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}

// One figure of the trip: label above, value below
function Stat({ label, icon: Icon, strong, children }) {
  return (
    <div className="grid gap-0.5 md:px-4 md:first:pl-0 lg:px-5">
      <dt className="text-xs whitespace-nowrap text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "flex items-center gap-1.5 font-medium whitespace-nowrap first-letter:uppercase",
          strong && "font-heading text-lg font-extrabold tabular-nums",
        )}
      >
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {children}
      </dd>
    </div>
  );
}

// A saved trip. Phone: photo on top, then the trip, its figures and the actions.
// Tablet and up: photo on the left; trip and actions on top, figures below.
// The whole card opens the trip; the button and the ⋯ menu sit above that link.
function TripCard({ trip }) {
  const { lang, t, f } = useI18n();
  const airports = useAirports(lang);
  const when = useWhen(trip);
  const { fare, origin } = trip;
  const originCity = findAirport(airports, origin)?.city;
  const RouteIcon = fare.ret ? ArrowLeftRight : ArrowRight;

  return (
    <article className="group relative grid overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow [grid-template-areas:'photo''info''stats''actions'] hover:shadow-lg hover:ring-foreground/20 md:grid-cols-[11rem_minmax(0,1fr)_auto] lg:grid-cols-[13rem_minmax(0,1fr)_auto] md:[grid-template-areas:'photo_info_actions''photo_stats_stats']">
      <TripPhoto code={fare.code} className="h-40 [grid-area:photo] md:m-3 md:mr-0 md:h-auto md:rounded-lg" />

      <div className="grid content-start gap-2 px-4 pt-4 [grid-area:info] md:px-5">
        <h2 className="font-heading text-xl leading-tight font-bold tracking-tight sm:text-2xl">
          <Link
            href={ROUTES.trip(lang, trip.id)}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {fare.city}, {fare.country}
          </Link>
        </h2>
        <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
          <span>{originCity ? `${originCity} (${origin})` : origin}</span>
          <RouteIcon className="size-4 shrink-0" />
          <span>
            {fare.city} ({fare.code})
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {trip.booked ? (
            <Chip icon={Ticket} className="bg-save/15 text-save">
              {t.trips.booked}
            </Chip>
          ) : (
            <Chip icon={Bookmark}>{t.trips.saved}</Chip>
          )}
          <Chip icon={Clock} className="first-letter:uppercase">
            <span className="first-letter:uppercase">{when}</span>
          </Chip>
          {airlinesOf(fare).map((airline) => (
            <AirlineBadge key={airline} airline={airline} />
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pt-4 [grid-area:stats] md:flex md:divide-x md:px-5 md:pb-4">
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

      <div className="relative z-10 flex items-start gap-2 p-4 [grid-area:actions] md:pl-0">
        <Button asChild className="h-10 flex-1 font-bold md:flex-none">
          <Link href={ROUTES.trip(lang, trip.id)}>
            {trip.itinerary ? t.trips.viewItinerary : t.trips.createItinerary}
            <ArrowRight />
          </Link>
        </Button>
        <TripMenu trip={trip} />
      </div>
    </article>
  );
}

// ⋯ quick actions: mark as booked, book with the airline, delete
function TripMenu({ trip }) {
  const { t, f } = useI18n();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-10" aria-label={t.trips.more}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onSelect={() => updateTrip(trip.id, { booked: !trip.booked })}>
            <Ticket /> {trip.booked ? t.trips.unmarkBooked : t.trips.markBooked}
          </DropdownMenuItem>
          {f.fareLinks(trip.fare, trip.origin).map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> {link.label}
              </a>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirming(true)}>
            <Trash2 /> {t.trips.remove}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteTripDialog trip={trip} open={confirming} onOpenChange={setConfirming} />
    </>
  );
}

function TripDetail({ trip }) {
  const { lang, t, f } = useI18n();
  const router = useRouter();
  const when = useWhen(trip);
  const { fare, origin } = trip;
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Link
        href={ROUTES.trips(lang)}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
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

      <Button
        variant="ghost"
        onClick={() => setConfirming(true)}
        className="justify-self-start text-muted-foreground hover:text-destructive"
      >
        <Trash2 /> {t.trips.remove}
      </Button>
      <DeleteTripDialog trip={trip} open={confirming} onOpenChange={setConfirming} onDeleted={() => router.replace(ROUTES.trips(lang))} />
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
