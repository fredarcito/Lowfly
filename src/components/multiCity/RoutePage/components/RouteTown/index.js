"use client";

import Link from "next/link";
import { ArrowRight, Bus, Car, MapPin, Ship, TrainFront } from "lucide-react";
import FadeImage from "@/components/shared/FadeImage";
import PhotoCredit from "@/components/shared/PhotoCredit";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { useI18n } from "@/context/i18n";
import { ROUTES } from "@/constants/routes";

const LAND_ICONS = { train: TrainFront, bus: Bus, ferry: Ship, car: Car };

// One town of a route's page, a stop on the route's line (RoutePage draws them in order): its number on the line, its
// name and nights (and the versions it is in, when not all), its photo, what it is like, what to see, a tip and, when
// the city has a guide, a quiet link to it (never competing with the page's one coloured button); then, on the line,
// how you get to the next town by land. Short on purpose: the day by day is the guide's, or the reader's own
// itinerary. `town`: server/multiCity/pages; `versionCount`: how many versions the route has.
const RouteTown = ({ lang, town, number, versionCount }) => {
  const { texts: appTexts, format } = useI18n();
  const texts = routePageTexts(lang);
  const names = texts.versions.names;
  const [firstVersion] = town.versions;
  const inVersions =
    town.versions.length === versionCount ? null : town.versions.length === 1 ? texts.onlyIn(names[firstVersion]) : texts.fromVersion(names[firstVersion]);
  const titleId = `town-${number}-title`;
  const LandIcon = town.land && (LAND_ICONS[town.land.by] ?? TrainFront);
  return (
    <li className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-x-6">
      {/* The route's line, from this town's number down to the next one's */}
      {town.land && <span aria-hidden="true" className="absolute top-9 bottom-0 left-4.5 w-0.5 -translate-x-1/2 bg-border sm:top-11 sm:left-5.5" />}
      <span className="relative grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-4 ring-background sm:size-11 sm:text-base">
        {number}
      </span>
      <section aria-labelledby={titleId} className="grid min-w-0 gap-4 pb-4">
        <div className="grid gap-0.5 pt-0.5 sm:pt-1">
          <h3 id={titleId} className="font-heading text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
            {town.city}
          </h3>
          <p className="text-sm text-muted-foreground">
            {texts.nights(town.nights)}
            {inVersions && ` · ${inVersions}`}
          </p>
        </div>
        {town.photo && (
          <figure className="relative aspect-16/10 overflow-hidden rounded-xl bg-muted sm:aspect-12/5">
            <FadeImage
              src={town.photo.src}
              width={town.photo.width}
              height={town.photo.height}
              alt={texts.photoOf(town.city)}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
            <PhotoCredit page={town.photo.page} text={appTexts.deals.photoBy(town.photo.author, town.photo.license)} className="right-3 bottom-3" />
          </figure>
        )}
        <p className="max-w-[68ch] text-base leading-relaxed sm:text-lg">{town.text}</p>
        <div className="grid gap-2.5">
          <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{texts.see}</h4>
          <ul className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
            {town.see.map((place) => (
              <li key={place} className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {place}
              </li>
            ))}
          </ul>
        </div>
        <div className="max-w-[68ch] border-l-2 border-primary pl-4">
          <p className="text-xs font-bold tracking-wider text-primary-ink uppercase">{texts.tip}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{town.tip}</p>
        </div>
        {town.guide && (
          <Link
            href={ROUTES.guide(lang, town.guide.slug)}
            className="group flex w-fit items-center gap-1.5 text-sm font-semibold text-primary-ink hover:underline"
          >
            {texts.guide(town.guide.city, town.guide.dayCount)}
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </section>
      {town.land && (
        <>
          <span className="relative my-5 grid size-9 place-items-center self-center justify-self-center rounded-full bg-card text-muted-foreground ring-1 ring-border">
            <LandIcon className="size-4" />
          </span>
          <p className="w-fit self-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            {texts.landTo(format.duration(town.land.minutes), texts.land[town.land.by], town.land.to)}
          </p>
        </>
      )}
    </li>
  );
};

export default RouteTown;
