import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, Plane, PlaneLanding, Waypoints } from "lucide-react";
import DestinationColumns from "@/components/flightRoutes/DestinationColumns";
import MonthPrices from "@/components/flightRoutes/RoutePage/components/MonthPrices";
import PlanCard from "@/components/flightRoutes/RoutePage/components/PlanCard";
import RouteFacts from "@/components/flightRoutes/RoutePage/components/RouteFacts";
import RouteFaq from "@/components/flightRoutes/RoutePage/components/RouteFaq";
import WhyGo from "@/components/flightRoutes/RoutePage/components/WhyGo";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { getDictionary, LOCALE_TAGS } from "@/i18n";
import { ROUTES } from "@/constants/routes";
import { createFormat } from "@/utils/format";

// How many destinations per region a route's page lists (its airport's page has them all)
const PER_REGION = 10;

// A route's page body (/es/flights/malta-barcelona; the photo header is RouteHero), rendered on the server for search
// engines: when it is cheapest to fly next to what to know about the route, why go next to "Create itinerary", the
// questions people ask about it, and the other destinations from the same airport by region. `prices`:
// server/flightRoutes/prices (null: none now); `airlines`, `duration`: written; `faq`: utils/routeFaq.
const RoutePage = ({ lang, route, prices, guide, routes, origin, airlines, duration, faq }) => {
  const texts = routeTexts(lang);
  const format = createFormat(lang, getDictionary(lang));
  const tag = LOCALE_TAGS[lang];
  const write = (amount) => format.money(amount, "EUR");
  const monthName = (month) => new Intl.DateTimeFormat(tag, { month: "short", timeZone: "UTC" }).format(new Date(`${month}-15T12:00:00Z`));
  const longMonth = (month) => new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-15T12:00:00Z`));
  const others = routes.filter((other) => other.slug !== route.slug);

  return (
    <article className="grid gap-6">
      {prices ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <MonthPrices lang={lang} route={route} months={prices.months} cheapestMonth={prices.cheapestMonth} write={write} monthName={monthName} />
          <RouteFacts
            lang={lang}
            facts={[
              { icon: Plane, label: texts.airlines, value: airlines },
              { icon: MapPin, label: texts.origin, value: `${route.origin.city} (${route.origin.code})` },
              { icon: PlaneLanding, label: texts.destination, value: `${route.city} (${route.airports.map((airport) => airport.code).join(" · ")})` },
              { icon: Clock, label: texts.duration, value: duration },
              { icon: Waypoints, label: texts.flightType, value: texts.direct },
              { icon: CalendarDays, label: texts.cheapestMonth, value: longMonth(prices.cheapestMonth) },
            ]}
          />
        </div>
      ) : (
        <p className="rounded-xl bg-card p-5 text-muted-foreground ring-1 ring-foreground/10">{texts.noPrices}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {guide ? <WhyGo lang={lang} city={route.city} guide={guide} /> : <span className="max-lg:hidden" />}
        <PlanCard lang={lang} route={route} />
      </div>

      <RouteFaq lang={lang} route={route} faq={faq} />

      {others.length > 0 && (
        <section className="grid gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid gap-0.5">
              <h2 className="font-heading text-xl font-bold">{texts.others(route.origin.city)}</h2>
              <p className="text-sm text-muted-foreground">{texts.othersHint(route.origin.city)}</p>
            </div>
            {origin && (
              <Link href={ROUTES.flightRoute(lang, origin.slug)} className="flex items-center gap-1.5 text-sm font-semibold text-primary-ink hover:underline">
                {texts.seeAll} <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
          <DestinationColumns lang={lang} routes={others} limit={PER_REGION} />
        </section>
      )}
    </article>
  );
};

export default RoutePage;
