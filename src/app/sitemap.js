import { LOCALES } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";
import { allRoutes, origins } from "@/server/flightRoutes/routes";
import { SITE_URL, languagesOf } from "@/utils/metadata";

// /sitemap.xml: the pages search engines should know, each in every language with its other languages (and
// x-default): the home, the airports' page, every airport's page and every route page, with when the cron last wrote
// their prices (lastmod) so the changed ones are read first. Made again once a day, as the routes change.
export const revalidate = 86400;

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

const sitemap = async () => {
  const [airports, routes] = await Promise.all([origins("en").catch(() => []), allRoutes("en").catch(() => [])]);
  const newest = airports.map((origin) => origin.updatedAt).sort().at(-1);
  return [
    ...entries(ROUTES.home, 1),
    ...entries(ROUTES.flights, 0.8, newest),
    ...airports.flatMap((origin) => entries((lang) => ROUTES.flightRoute(lang, origin.slug), 0.8, origin.updatedAt)),
    ...routes.flatMap((route) => entries((lang) => ROUTES.flightRoute(lang, route.slug), 0.7, route.updatedAt)),
  ];
};

export default sitemap;
