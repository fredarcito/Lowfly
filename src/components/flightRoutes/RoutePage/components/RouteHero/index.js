import Link from "next/link";
import { Clock, Plane, Search, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { searchLink } from "@/components/flightRoutes/RoutePage/utils/searchLink";
import { fallbackPhoto } from "@/utils/fallbackPhoto";

// The top of a route's page, over the destination's photo (a generic travel one without it): the route, its
// airlines, flight time and "direct", the lowest price and "See dates and prices". `price`: written; `airlines`:
// their names, joined; `duration`: written, or null.
const RouteHero = ({ lang, route, price, airlines, duration, photo }) => {
  const texts = routeTexts(lang);
  return (
    <div className="grid gap-4 pt-4 pb-2 sm:pt-2 sm:pb-6">
      <PhotoBackdrop image={photo ?? fallbackPhoto(route.airports[0].code)} photo={photo} alt={texts.photoAlt(route.city)} />
      <h1 className="max-w-[16ch] font-heading text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">
        {texts.title(route.origin.city, route.city)}
      </h1>
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-hero-muted sm:text-lg">
        <span className="flex items-center gap-1.5">
          <Plane className="size-4 -rotate-45" /> {airlines}
        </span>
        {duration && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {duration}
            </span>
          </>
        )}
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1.5">
          <Waypoints className="size-4" /> {texts.direct}
        </span>
      </p>
      {price && (
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-hero-muted">{texts.from}</span>
          <span className="font-heading text-4xl font-extrabold tracking-tight text-primary tabular-nums sm:text-5xl">{price}</span>
          <span className="text-sm text-hero-muted">{texts.oneWay}</span>
        </p>
      )}
      <Button asChild className="mt-1 h-12 w-fit px-6 text-base font-bold">
        <Link href={searchLink(lang, route)}>
          <Search /> {texts.searchDates}
        </Link>
      </Button>
    </div>
  );
};

export default RouteHero;
