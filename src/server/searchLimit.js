// How many flight searches a visitor (their IP) may ask the server for. The airline guard (server/airlineGuard) paces
// the requests to Ryanair and Wizz for everyone together, so a bot asking route after route takes the turns of the
// people searching meanwhile: they wait, and get "busy" or old prices. A person searches a few times a minute and a
// few dozen a day; past that, the search answers 429 with the limit's code (texts.errors).
// Every call counts: a search to a country is two (its direct flights and its trips through a hub). The CDN answers
// the repeated ones without reaching here, so only the searches that may ask the airlines count. Counted in Redis,
// across every server instance; on the dev server (and without Redis), in this instance's memory. Only called from
// the server.
import { AppError } from "@/server/errors";
import { allow } from "@/server/rateLimit";
import { deployed, redis, redisKey } from "@/server/redis";

// Calls a visitor may make in each window (fixed windows: this minute, this UTC day)
export const SEARCH_LIMITS = [
  { code: "tooManySearches", calls: 30, seconds: 60 },
  { code: "searchesToday", calls: 150, seconds: 86_400 },
];

// The dev server's own visitors (the browser tests, from this machine) search more than a person
const LOCAL = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];

// Visitors already over a limit: visitor → { code, until }. Asked again before `until`, refused without asking Redis
const refused = new Map();

const refusal = (code) => new AppError(code, {}, 429);

// The visitor's counts in this window, one per limit (null when Redis fails: the search goes on)
const countInRedis = async (store, visitor) => {
  const now = Math.floor(Date.now() / 1000);
  const keys = SEARCH_LIMITS.map((limit) => redisKey("searches", limit.seconds, Math.floor(now / limit.seconds), visitor));
  try {
    const batch = store.pipeline();
    for (const key of keys) batch.incr(key);
    const counts = await batch.exec();
    // A new window: its key goes when the window ends
    const fresh = SEARCH_LIMITS.map((limit, index) => ({ key: keys[index], seconds: limit.seconds })).filter((window, index) => counts[index] === 1);
    if (fresh.length) {
      const expiring = store.pipeline();
      for (const window of fresh) expiring.expire(window.key, window.seconds);
      await expiring.exec();
    }
    return counts;
  } catch (error) {
    console.error("Search limit", error.message);
    return null;
  }
};

// Throws a 429 AppError when the visitor of `request` is over a limit
export const limitSearches = async (request) => {
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const store = deployed() ? redis() : null;
  if (!store) {
    if (LOCAL.includes(visitor)) return;
    for (const limit of SEARCH_LIMITS) if (!allow(`searches:${limit.seconds}:${visitor}`, limit.calls, limit.seconds * 1000)) throw refusal(limit.code);
    return;
  }

  const now = Date.now();
  const known = refused.get(visitor);
  if (known && known.until > now) throw refusal(known.code);
  const counts = await countInRedis(store, visitor);
  const over = counts && SEARCH_LIMITS.findIndex((limit, index) => counts[index] > limit.calls);
  if (!counts || over === -1) return;
  const limit = SEARCH_LIMITS[over];
  const windowMs = limit.seconds * 1000;
  refused.set(visitor, { code: limit.code, until: (Math.floor(now / windowMs) + 1) * windowMs });
  // Keep the map small
  if (refused.size > 5000) for (const [stale, entry] of refused) if (entry.until <= now) refused.delete(stale);
  throw refusal(limit.code);
};
