import { Redis } from "@upstash/redis";
import { expect, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// Wizz Air's and Ryanair's searches go through the airline guard (server/airlineGuard), with the app's Redis: needs
// its keys (.env.local, from `vercel env pull`). The keys are the dev server's (development:…), never production's.
// The dev server uses Redis for the guard only with AIRLINE_GUARD_REDIS=1 (every environment shares its free
// commands): `AIRLINE_GUARD_REDIS=1 pnpm test:e2e e2e/airline-guard.spec.js`, with no dev server running (the one the
// tests start gets it too).
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const store = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;
const airlineKey = (airline, ...parts) => [process.env.VERCEL_ENV ?? "development", airline, ...parts].join(":");
const wizzKey = (...parts) => airlineKey("wizz", ...parts);

// Every key matching `pattern`
const keysLike = async (pattern) => {
  const found = [];
  let cursor = "0";
  do {
    const [next, keys] = await store.scan(cursor, { match: pattern, count: 1000 });
    found.push(...keys);
    cursor = String(next);
  } while (cursor !== "0");
  return found;
};

const from = dayFromNow(20);
const to = dayFromNow(35);
const months = [...new Set([from, to].map((day) => day.slice(0, 7)))];
const everywhere = (origin) => `/api/everywhere?origin=${origin}&from=${from}&to=${to}&lang=es`;
const wizzFares = (body) => body.results.filter((result) => JSON.stringify(result).includes('"wizz"'));

// Real searches at Ryanair and Wizz: tagged @live
test.describe("airline guard @live", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });
  test.skip(!store, "Redis keys are not set (.env.local)");
  test.skip(process.env.AIRLINE_GUARD_REDIS !== "1", "The guard uses Redis on the dev server only with AIRLINE_GUARD_REDIS=1");

  test("a search keeps Wizz's and Ryanair's answers for the next visitors", async ({ request }) => {
    const response = await request.get(everywhere("BUD"));
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.failed).toEqual([]);
    expect(wizzFares(body).length).toBeGreaterThan(0);
    for (const month of months) expect(await store.exists(wizzKey("cache", `fare-finder:BUD:${month}:one-way`))).toBe(1);
    const ryanairSearch = `oneWayFares?*departureAirportIataCode=BUD*outboundDepartureDateFrom=${from}*`;
    expect((await keysLike(airlineKey("ryanair", "cache", ryanairSearch))).length).toBeGreaterThan(0);
  });

  test("while Wizz blocks us it is not asked: what was kept is served, and the rest of the search goes on", async ({ request }) => {
    // Gdańsk with nothing kept, so Wizz has nothing to give
    await store.del(...months.map((month) => wizzKey("cache", `fare-finder:GDN:${month}:one-way`)));
    // As short as possible: other tests may be searching Wizz meanwhile
    await store.set(wizzKey("blocked"), 1, { ex: 60 });
    try {
      const kept = await (await request.get(everywhere("BUD"))).json();
      expect(kept.failed).not.toContain("wizz");
      expect(wizzFares(kept).length).toBeGreaterThan(0);

      const missing = await (await request.get(everywhere("GDN"))).json();
      expect(missing.failed).toContain("wizz");
      expect(missing.results.length).toBeGreaterThan(0);
      expect(wizzFares(missing)).toEqual([]);
    } finally {
      await store.del(wizzKey("blocked"));
    }
  });
});
