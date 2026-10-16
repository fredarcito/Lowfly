import { notFound } from "next/navigation";
import OriginPage from "@/components/flightRoutes/OriginPage";
import OriginHero from "@/components/flightRoutes/OriginPage/components/OriginHero";
import RoutePage from "@/components/flightRoutes/RoutePage";
import RouteHero from "@/components/flightRoutes/RoutePage/components/RouteHero";
import TripsPage from "@/components/trips/TripsPage";
import { routeTexts } from "@/components/flightRoutes/data/texts";
import { I18nProvider } from "@/providers/I18nProvider";
import { LOCALES, LOCALE_TAGS, getDictionary } from "@/i18n";
import { AIRLINES, createFormat } from "@/utils/format";
import { findOrigin, findRoute, origins, routesFrom } from "@/server/flightRoutes/routes";
import { originPrices } from "@/server/flightRoutes/originPrices";
import { routePrices } from "@/server/flightRoutes/prices";
import { getGuides } from "@/server/guides";
import { getPhotos } from "@/server/photos";
import { ROUTES } from "@/constants/routes";

// Search engines' pages: an airport's (/es/flights/malta: every destination) or a route's (/es/flights/malta-barcelona).
// Any route address may be asked for (the language layout only allows /es and /en). Made on each visit, from the
// airlines' prices kept a day in Next's data cache (and served from the CDN for a day): the airlines are asked rarely.
export const revalidate = 86400;
export const dynamicParams = true;

const photoOf = async (code) => (await getPhotos([code]).catch(() => ({})))[code] ?? null;

// An airport's page: { kind: "origin", origin, routes, prices (written), photo }
const loadOrigin = async (origin, lang) => {
  const format = createFormat(lang, getDictionary(lang));
  const [routes, photo] = await Promise.all([routesFrom(origin.code, lang), photoOf(origin.code)]);
  const prices = await originPrices(origin.code, routes, lang).catch(() => ({}));
  const written = Object.fromEntries(Object.entries(prices).map(([slug, price]) => [slug, format.money(price, "EUR")]));
  return { kind: "origin", origin, routes, prices: written, cheapest: Object.values(prices).length ? Math.min(...Object.values(prices)) : null, photo };
};

// A route's page: { kind: "route", route, prices, routes (from the same airport), origin, guide, photo, airlines,
// duration (written) }
const loadRoute = async (route, lang) => {
  const format = createFormat(lang, getDictionary(lang));
  const code = route.airports[0].code;
  const [prices, routes, photo, origin] = await Promise.all([
    routePrices(route).catch(() => null),
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

const alternates = (slug, lang) => ({
  canonical: ROUTES.flightRoute(lang, slug),
  languages: Object.fromEntries(LOCALES.map((locale) => [locale, ROUTES.flightRoute(locale, slug)])),
});

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
    alternates: alternates(slug, lang),
    openGraph: { title, description, url: ROUTES.flightRoute(lang, slug), ...(data.photo && { images: [data.photo.src] }) },
  };
};

const FlightsPage = async ({ params }) => {
  const { lang, route: slug } = await params;
  const data = await load(lang, slug);
  if (!data) notFound();
  if (data.kind === "origin") {
    return (
      <I18nProvider lang={lang}>
        <TripsPage hero={<OriginHero lang={lang} origin={data.origin} count={data.routes.length} photo={data.photo} />}>
          <OriginPage lang={lang} routes={data.routes} prices={data.prices} />
        </TripsPage>
      </I18nProvider>
    );
  }
  const price = data.prices && createFormat(lang, getDictionary(lang)).money(data.prices.cheapest.price, "EUR");
  return (
    <I18nProvider lang={lang}>
      <TripsPage hero={<RouteHero lang={lang} route={data.route} price={price} airlines={data.airlines} duration={data.duration} photo={data.photo} />}>
        <RoutePage lang={lang} {...data} />
      </TripsPage>
    </I18nProvider>
  );
};

export default FlightsPage;
