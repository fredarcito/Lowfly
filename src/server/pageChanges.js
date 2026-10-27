// The site's pages that are new, changed or gone since the cron last told IndexNow about them (server/indexNow).
// Every page is in the sitemap (server/sitemap): one that was not told before is new, and one told that is no longer
// there is gone (told too, so the search engines drop it). A new kind of page needs nothing here: being in the
// sitemap is enough. The city guides and multi-city routes also have their words' fingerprint, as they change with a
// deploy: an edited one is told again, with the page that lists them. The other pages count only when new (a route's
// prices change every night: the sitemap's lastmod says so). What was told is one Redis hash, path → fingerprint:
// one command a run, two or three when something changed. Only called from the server.
import { createHash } from "node:crypto";
import { redis, redisKey } from "@/server/redis";
import { publishedRoutes, sitemapEntries } from "@/server/sitemap";
import { cityGuideById, listCityGuides } from "@/server/cityGuides";
import { getRoutePage, listRoutePages } from "@/server/multiCity/pages";
import { SITE_URL } from "@/utils/metadata";
import { ROUTES } from "@/constants/routes";
import { LOCALES } from "@/i18n/config";

const key = () => redisKey("index-now", "content");

// The fingerprint of a page whose words are not followed: told once, when it appears
const SEEN = "seen";

// Never only digits: Upstash reads back a value that looks like a number as a number
const fingerprint = (content) => `v1-${createHash("sha1").update(JSON.stringify(content)).digest("hex").slice(0, 16)}`;

// The pages whose words are followed, in every language: [{ path, print, list (the page listing them) }]
const writtenPages = () =>
  LOCALES.flatMap((lang) => [
    ...listCityGuides(lang).map((guide) => ({
      path: ROUTES.guide(lang, guide.slug),
      print: fingerprint(cityGuideById(guide.id, lang)),
      list: ROUTES.guides(lang),
    })),
    ...listRoutePages(lang).map((page) => ({
      path: ROUTES.multiCityRoute(lang, page.slug),
      print: fingerprint(getRoutePage(page.slug, lang)),
      list: ROUTES.search(lang, "multiCity"),
    })),
  ]);

// Every page of the sitemap as it is now: Map path → fingerprint, and the page listing each written one. The routes
// are read without the sitemap's fallback: a failed read throws, never taken for every route page gone.
const currentPages = async () => {
  const pages = new Map(sitemapEntries(await publishedRoutes()).map((entry) => [entry.url.slice(SITE_URL.length), SEEN]));
  const lists = new Map();
  for (const page of writtenPages()) {
    if (!pages.has(page.path)) continue;
    pages.set(page.path, page.print);
    lists.set(page.path, page.list);
  }
  return { pages, lists };
};

const NOTHING = { paths: [], save: async () => {} };

// The pages new, changed or gone since last told, and the pages listing the changed ones: { paths, save }
// (`save()`: remembers them as told, once IndexNow has them). Without Redis, or when a read fails, nothing: there is
// nothing to compare with.
export const changedPages = async () => {
  const client = redis();
  if (!client) return NOTHING;
  try {
    const [told, { pages, lists }] = await Promise.all([client.hgetall(key()).then((found) => found ?? {}), currentPages()]);
    const changed = [...pages].filter(([path, print]) => told[path] !== print);
    const gone = Object.keys(told).filter((path) => !pages.has(path));
    if (!changed.length && !gone.length) return NOTHING;
    const listing = changed.map(([path]) => lists.get(path)).filter(Boolean);
    return {
      paths: [...new Set([...changed.map(([path]) => path), ...listing, ...gone])],
      save: async () => {
        try {
          if (changed.length) await client.hset(key(), Object.fromEntries(changed));
          if (gone.length) await client.hdel(key(), ...gone);
        } catch (error) {
          console.error("Told pages", error.message);
        }
      },
    };
  } catch (error) {
    console.error("Changed pages", error.message);
    return NOTHING;
  }
};
