import { notFound, permanentRedirect } from "next/navigation";
import RoutePage from "@/components/multiCity/RoutePage";
import RouteHero from "@/components/multiCity/RoutePage/components/RouteHero";
import TripsPage from "@/components/trips/TripsPage";
import JsonLd from "@/components/shared/JsonLd";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { I18nProvider } from "@/providers/I18nProvider";
import { LOCALES } from "@/i18n/config";
import { APP_NAME, LOCALE_TAGS } from "@/i18n";
import { getRoutePage, listRoutePages, routePageSlugIn } from "@/server/multiCity/pages";
import { ROUTES } from "@/constants/routes";
import { SITE_URL, alternatesOf, breadcrumbsOf, faqPageOf, openGraphOf } from "@/utils/metadata";

// A multi-city route's own page (/es/recorridos/italia-clasica; /en/multi-city/classic-italy, through src/proxy.js
// as the "Recorridos" search's name), for search engines: what the route is like, town by town, as
// src/data/multiCityPages/<route>.json has it (never made on a visit), every page made at build time. Its own folder, outside
// the search pages' group: no search form here, only the way to it. Its name in another language
// (/es/recorridos/classic-italy) is sent to this language's; any other name is not found.
export const dynamicParams = true;
export const generateStaticParams = () => LOCALES.flatMap((lang) => listRoutePages(lang).map((page) => ({ lang, route: page.slug })));

export const generateMetadata = async ({ params }) => {
  const { lang, route: slug } = await params;
  const page = getRoutePage(slug, lang);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.summary,
    alternates: alternatesOf(lang, (locale) => ROUTES.multiCityRoute(locale, page.slugs[locale] ?? page.id)),
    openGraph: openGraphOf(lang, { title: page.metaTitle, description: page.summary, url: ROUTES.multiCityRoute(lang, slug), image: page.photo?.src }),
  };
};

// For search engines: the way to it (Lowfly › Recorridos › the route) and the trip itself, its towns in order
// (schema.org TouristTrip, each a TouristDestination with what to see there), with when it was written
const structuredData = (lang, page) => {
  const texts = routePageTexts(lang);
  const path = ROUTES.multiCityRoute(lang, page.slug);
  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: page.title,
    description: page.summary,
    inLanguage: LOCALE_TAGS[lang],
    url: `${SITE_URL}${path}`,
    dateModified: page.writtenAt,
    itinerary: {
      "@type": "ItemList",
      itemListElement: page.towns.map((town, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristDestination",
          name: town.city,
          description: town.text,
          geo: { "@type": "GeoCoordinates", latitude: town.lat, longitude: town.lng },
          includesAttraction: town.see.map((place) => ({ "@type": "TouristAttraction", name: place })),
        },
      })),
    },
  };
  const breadcrumbs = breadcrumbsOf([
    { name: APP_NAME, path: ROUTES.home(lang) },
    { name: texts.section, path: ROUTES.search(lang, "multiCity") },
    { name: page.title, path },
  ]);
  return [breadcrumbs, trip];
};

const MultiCityRoutePage = async ({ params }) => {
  const { lang, route: slug } = await params;
  const page = getRoutePage(slug, lang);
  if (!page) {
    const named = routePageSlugIn(slug, lang);
    if (named) permanentRedirect(ROUTES.multiCityRoute(lang, named));
    notFound();
  }
  // The language switch goes to the same route under its name in the other language
  const paths = Object.fromEntries(LOCALES.map((locale) => [locale, ROUTES.multiCityRoute(locale, page.slugs[locale] ?? page.id)]));
  const [breadcrumbs, trip] = structuredData(lang, page);
  return (
    <I18nProvider lang={lang} paths={paths}>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={trip} />
      <JsonLd data={faqPageOf(page.faq)} />
      <TripsPage hero={<RouteHero lang={lang} page={page} />}>
        <RoutePage lang={lang} page={page} />
      </TripsPage>
    </I18nProvider>
  );
};

export default MultiCityRoutePage;
