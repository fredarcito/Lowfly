import { LOCALES } from "@/i18n/config";
import { ROUTES } from "@/constants/routes";
import { SITE_DOMAIN } from "@/constants/site";
import { allRoutes, origins } from "@/server/flightRoutes/routes";

// /sitemap.xml: the pages search engines should know, in every language (each with its other languages): the
// home, the airports' page, every airport's page and every route page. Made again once a day, as the routes change.
export const revalidate = 86400;

const SITE = `https://${SITE_DOMAIN}`;

const entry = (path, priority) => ({
  url: `${SITE}${path("es")}`,
  changeFrequency: "daily",
  priority,
  alternates: { languages: Object.fromEntries(LOCALES.map((lang) => [lang, `${SITE}${path(lang)}`])) },
});

const sitemap = async () => {
  const [airports, routes] = await Promise.all([origins("en").catch(() => []), allRoutes("en").catch(() => [])]);
  return [
    entry(ROUTES.home, 1),
    entry(ROUTES.flights, 0.8),
    ...airports.map((origin) => entry((lang) => ROUTES.flightRoute(lang, origin.slug), 0.8)),
    ...routes.map((route) => entry((lang) => ROUTES.flightRoute(lang, route.slug), 0.7)),
  ];
};

export default sitemap;
