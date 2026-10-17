import { notFound } from "next/navigation";
import OriginPage from "@/components/flightRoutes/OriginPage";
import OriginHero from "@/components/flightRoutes/OriginPage/components/OriginHero";
import RoutePage from "@/components/flightRoutes/RoutePage";
import RouteHero from "@/components/flightRoutes/RoutePage/components/RouteHero";
import TripsPage from "@/components/trips/TripsPage";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { I18nProvider } from "@/providers/I18nProvider";
import { APP_NAME, LOCALE_TAGS, getDictionary } from "@/i18n";
import { AIRLINES, createFormat } from "@/utils/format";
import { findOrigin, findRoute, origins, routesFrom } from "@/server/flightRoutes/routes";
import { originPrices, routePrices } from "@/server/flightRoutes/prices";
import { getGuides } from "@/server/guides";
import { getPhotos } from "@/server/photos";
import { ROUTES } from "@/constants/routes";
import { alternatesOf, breadcrumbsOf } from "@/utils/metadata";
import JsonLd from "@/components/shared/JsonLd";

// Search engines' pages: an airport's (/es/flights/malta: every destination) or a route's (/es/flights/malta-barcelona).
// Any route address may be asked for (the language layout only allows /es and /en). Made on its first visit from
// what the cron saved (server/flightRoutes/snapshots: never the airlines), then served from the CDN; made again a
// day later, or as soon as the cron writes new prices. No address is made at build time: the empty list is what
// lets Next keep the pages made on a visit (without it, every visit would make the page again).
export const revalidate = 86400;
export const dynamicParams = true;
export const generateStaticParams = () => [];

const photoOf = async (code) => (await getPhotos([code]).catch(() => ({})))[code] ?? null;

// An airport's page: { kind: "origin", origin, routes, prices (written), photo }
const loadOrigin = async (origin, lang) => {
  const format = createFormat(lang, getDictionary(lang));
  const [routes, prices, photo] = await Promise.all([routesFrom(origin.code, lang), originPrices(origin.code, lang), photoOf(origin.code)]);
  const written = Object.fromEntries(Object.entries(prices).map(([slug, price]) => [slug, format.money(price, "EUR")]));
  return { kind: "origin", origin, routes, prices: written, cheapest: Object.values(prices).length ? Math.min(...Object.values(prices)) : null, photo };
};

// A route's page: { kind: "route", route, prices, routes (from the same airport), origin, guide, photo, airlines,
// duration (written) }
const loadRoute = async (route, lang) => {
  const format = createFormat(lang, getDictionary(lang));
  const code = route.airports[0].code;
  const [prices, routes, photo, origin] = await Promise.all([
    routePrices(route, lang),
    routesFrom(route.origin.code, lang),
    photoOf(code),
    origins(lang).then((all) => all.find((origin) => origin.code === route.origin.code) ?? null),
  ]);
  const names = (prices?.airlines ?? [...new Set(route.airports.flatMap((airport) => airport.airlines))]).map((airline) => AIRLINES[airline] ?? airline);
  return {
    kind: "route",
    route,
    prices,
    routes,
    origin,
    guide: getGuides([code], lang)[code],
    photo,
    airlines: new Intl.ListFormat(LOCALE_TAGS[lang], { style: "long", type: "conjunction" }).format(names),
    duration: prices?.minutes ? format.duration(prices.minutes) : null,
  };
};

const load = async (lang, slug) => {
  const origin = await findOrigin(slug, lang);
  if (origin) return loadOrigin(origin, lang);
  const route = await findRoute(slug, lang);
  return route ? loadRoute(route, lang) : null;
};

export const generateMetadata = async ({ params }) => {
  const { lang, route: slug } = await params;
  const data = await load(lang, slug);
  if (!data) return {};
  const texts = routeTexts(lang);
  const format = createFormat(lang, getDictionary(lang));
  const money = (amount) => (amount ? format.money(amount, "EUR") : null);
  const [title, description] =
    data.kind === "origin"
      ? [texts.originPage.metaTitle(data.origin.city, data.routes.length), texts.originPage.metaDescription(data.origin.city, data.routes.length, money(data.cheapest))]
      : [
          texts.metaTitle(data.route.origin.city, data.route.city, money(data.prices?.cheapest.price)),
          texts.metaDescription(data.route.origin.city, data.route.city, money(data.prices?.cheapest.price), data.airlines),
        ];
  return {
    title,
    description,
    alternates: alternatesOf(lang, (locale) => ROUTES.flightRoute(locale, slug)),
    openGraph: { title, description, url: ROUTES.flightRoute(lang, slug), ...(data.photo && { images: [data.photo.src] }) },
  };
};

// The way to the page, for search engines: Lowfly › Cheap flights by airport › Cheap flights from Malta (› the route)
const breadcrumbs = (lang, slug, data) => {
  const texts = routeTexts(lang);
  const { origin } = data;
  const steps = [
    { name: APP_NAME, path: ROUTES.home(lang) },
    { name: texts.airportsPage.title, path: ROUTES.flights(lang) },
    ...(origin ? [{ name: texts.originPage.title(origin.city), path: ROUTES.flightRoute(lang, origin.slug) }] : []),
    ...(data.kind === "route" ? [{ name: texts.title(data.route.origin.city, data.route.city), path: ROUTES.flightRoute(lang, slug) }] : []),
  ];
  return breadcrumbsOf(steps);
};

const FlightsPage = async ({ params }) => {
  const { lang, route: slug } = await params;
  const data = await load(lang, slug);
  if (!data) notFound();
  if (data.kind === "origin") {
    return (
      <I18nProvider lang={lang}>
        <JsonLd data={breadcrumbs(lang, slug, data)} />
        <TripsPage hero={<OriginHero lang={lang} origin={data.origin} count={data.routes.length} photo={data.photo} />}>
          <OriginPage lang={lang} routes={data.routes} prices={data.prices} />
        </TripsPage>
      </I18nProvider>
    );
  }
  const price = data.prices && createFormat(lang, getDictionary(lang)).money(data.prices.cheapest.price, "EUR");
  return (
    <I18nProvider lang={lang}>
      <JsonLd data={breadcrumbs(lang, slug, data)} />
      <TripsPage hero={<RouteHero lang={lang} route={data.route} price={price} airlines={data.airlines} duration={data.duration} photo={data.photo} />}>
        <RoutePage lang={lang} {...data} />
      </TripsPage>
    </I18nProvider>
  );
};

export default FlightsPage;
