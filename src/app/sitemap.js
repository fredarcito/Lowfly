import { publishedRoutes, sitemapEntries } from "@/server/sitemap";

// /sitemap.xml: every page search engines should know (server/sitemap). Made again once a day, as the routes change.
// When the routes cannot be read, the other pages are still listed.
export const revalidate = 86400;

const sitemap = async () => sitemapEntries(await publishedRoutes().catch(() => ({ airports: [], routes: [] })));

export default sitemap;
