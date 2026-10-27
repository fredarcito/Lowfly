// The pages search engines should know (app/sitemap, and what the cron tells IndexNow: server/pageChanges), each in
// every language with its other languages (and x-default): the home, each kind of search's page, the airports' page,
// every airport's page, every route page, the city guides and the multi-city routes' pages, with when the cron last
// wrote their prices (lastmod) so the changed ones are read first. Only called from the server.
import { LOCALES } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";
import { allRoutes, origins } from "@/server/flightRoutes/routes";
import { SITE_URL, languagesOf } from "@/utils/metadata";
import { listCityGuides } from "@/server/cityGuides";
import { listRoutePages } from "@/server/multiCity/pages";
import { SEARCH_PAGES } from "@/constants/searchPages";

const absolute = (languages) => Object.fromEntries(Object.entries(languages).map(([lang, path]) => [lang, `${SITE_URL}${path}`]));

// One entry per language of the page `path` (lang → path)
const entries = (path, priority, lastModified) => {
  const languages = absolute(languagesOf(path));
  return LOCALES.map((lang) => ({
    url: `${SITE_URL}${path(lang)}`,
    ...(lastModified && { lastModified }),
    changeFrequency: "daily",
    priority,
    alternates: { languages },
  }));
};

// The airports and routes with pages, as the cron last wrote them: { airports, routes }. A failed read throws
export const publishedRoutes = async () => {
  const [airports, routes] = await Promise.all([origins("en"), allRoutes("en")]);
  return { airports, routes };
};

// Every page's entry, with the airports and routes of `published` (publishedRoutes)
export const sitemapEntries = ({ airports, routes }) => {
  const newest = airports.map((origin) => origin.updatedAt).sort().at(-1);
  return [
    ...entries(ROUTES.home, 1),
    ...Object.keys(SEARCH_PAGES).flatMap((mode) => entries((lang) => ROUTES.search(lang, mode), 0.9)),
    ...entries(ROUTES.flights, 0.8, newest),
    ...airports.flatMap((origin) => entries((lang) => ROUTES.flightRoute(lang, origin.slug), 0.8, origin.updatedAt)),
    ...routes.flatMap((route) => entries((lang) => ROUTES.flightRoute(lang, route.slug), 0.7, route.updatedAt)),
    ...entries(ROUTES.guides, 0.6),
    ...listCityGuides("en").flatMap((guide) => entries((lang) => ROUTES.guide(lang, guide.slugs[lang] ?? guide.id), 0.7)),
    ...listRoutePages("en").flatMap((page) => entries((lang) => ROUTES.multiCityRoute(lang, page.slugs[lang] ?? page.id), 0.7)),
  ];
};
