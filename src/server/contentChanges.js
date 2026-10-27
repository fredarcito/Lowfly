// The city guides' and multi-city routes' pages whose words changed since the cron last told IndexNow about them
// (server/indexNow). They live in the code (src/data), so they only change with a deploy: the route pages' cron
// notices it the night after. Each page's fingerprint (a hash of what it shows) is kept in one Redis hash: one
// command a run, two when something changed. Only called from the server.
import { createHash } from "node:crypto";
import { redis, redisKey } from "@/server/redis";
import { cityGuideById, listCityGuides } from "@/server/cityGuides";
import { getRoutePage, listRoutePages } from "@/server/multiCity/pages";
import { ROUTES } from "@/constants/routes";
import { LOCALES } from "@/i18n/config";

const key = () => redisKey("index-now", "content");

// Never only digits: Upstash reads back a value that looks like a number as a number
const fingerprint = (content) => `v1-${createHash("sha1").update(JSON.stringify(content)).digest("hex").slice(0, 16)}`;

// Every guide's and route's page as it is now, in every language: [{ path, print, list (the page listing them) }]
const contentPages = () =>
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

const NOTHING = { paths: [], save: async () => {} };

// The pages new or changed since last told, and the pages listing them: { paths, save } (`save()`: remembers them
// as told, once IndexNow has them). Without Redis, or when it fails, nothing: there is nothing to compare with.
export const changedContent = async () => {
  const client = redis();
  if (!client) return NOTHING;
  try {
    const told = (await client.hgetall(key())) ?? {};
    const changed = contentPages().filter((page) => told[page.path] !== page.print);
    if (!changed.length) return NOTHING;
    return {
      paths: [...new Set(changed.flatMap((page) => [page.path, page.list]))],
      save: () => client.hset(key(), Object.fromEntries(changed.map((page) => [page.path, page.print]))).catch(() => {}),
    };
  } catch (error) {
    console.error("Content fingerprints", error.message);
    return NOTHING;
  }
};
