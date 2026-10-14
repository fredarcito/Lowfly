"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Copyright, Ticket } from "lucide-react";
import DestinationGuide from "@/components/shared/DestinationGuide";
import TripMenu from "@/components/trips/TripMenu";
import { useI18n } from "@/context/i18n";
import { usePhoto } from "@/hooks/usePhoto";
import { useTripWhen } from "@/hooks/useTripWhen";
import { ROUTES } from "@/constants/routes";

// The destination photo behind the header, blended into its dark background: on the right on desktop
// (fading to the left and down, so the text stays on plain dark), dimmed behind the text on phones.
// In the dark theme it is also darkened, so the white text and the buttons on top of it always read.
// The © in the corner credits it, as its licence requires.
const TripBackdrop = ({ code }) => {
  const { t } = useI18n();
  const photo = usePhoto(code);
  if (!photo) return null;
  const credit = t.deals.photoBy(photo.author, photo.license);
  return (
    <>
      {/* Two nested masks (fade to the bottom, then to the left) instead of one with two layers */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-35 mask-[linear-gradient(to_bottom,black_45%,transparent)] duration-700 animate-in fade-in motion-reduce:animate-none md:left-auto md:w-[68%] md:opacity-90 md:mask-[linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <img
          src={photo.src}
          alt=""
          className="size-full object-cover dark:brightness-75 md:mask-[linear-gradient(to_right,transparent,rgb(0_0_0/0.15)_18%,rgb(0_0_0/0.6)_40%,black_62%)]"
        />
        {/* Fading into the background at the top, where the theme, language and ⋯ buttons sit over the photo */}
        <div className="absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-background/85 to-transparent" />
      </div>
      <a
        href={photo.page}
        target="_blank"
        rel="noopener noreferrer"
        title={credit}
        aria-label={credit}
        className="absolute right-4 bottom-4 z-10 grid size-6 place-items-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm hover:bg-black/50 hover:text-white sm:right-6"
      >
        <Copyright className="size-3.5" />
      </a>
    </>
  );
};

// Top of a trip, over the destination photo: back to the list, destination, dates, nights and when it is,
// why the destination is worth a visit, and the ⋯ menu
const TripHeader = ({ trip, onDeleted }) => {
  const { lang, t, f } = useI18n();
  const when = useTripWhen(trip);
  const { fare } = trip;
  const dates = fare.ret ? f.fmtRange(fare.day, fare.ret.day) : f.fmtDay(fare.day);

  return (
    <div className="grid gap-3">
      <TripBackdrop code={fare.code} />

      <div className="flex items-start justify-between gap-4">
        <Link
          href={ROUTES.trips(lang)}
          className="mt-2 flex w-fit items-center gap-1.5 text-sm font-medium text-hero-muted hover:text-hero-foreground"
        >
          <ArrowLeft className="size-4" /> {t.trips.backToList}
        </Link>
        {/* Round and on glass like the theme button above it, so it shows over the photo */}
        <TripMenu
          trip={trip}
          onDeleted={onDeleted}
          variant="ghost"
          className="rounded-full bg-hero-chip text-hero-foreground backdrop-blur-sm hover:bg-hero-chip hover:text-hero-foreground aria-expanded:bg-hero-chip dark:hover:bg-hero-chip"
        />
      </div>

      <h1 className="font-heading text-4xl leading-none font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">
        {fare.city}, {fare.country}
      </h1>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-hero-muted sm:text-lg">
        <span className="first-letter:uppercase">
          {dates}
          {fare.ret && ` · ${t.units.nights(fare.nights)}`}
        </span>
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <span className="first-letter:uppercase">{when}</span>
        </span>
        {trip.booked && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1.5 text-save">
              <Ticket className="size-4" /> {t.trips.booked}
            </span>
          </>
        )}
      </p>

      <DestinationGuide code={fare.code} className="mt-1 max-w-[60ch] pb-0" textClassName="text-hero-muted sm:text-base" />
    </div>
  );
};

export default TripHeader;
