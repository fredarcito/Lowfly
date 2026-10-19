import { expect, test } from "./helpers/test.js";

// The route graph (docs/stopovers.md): every route Ryanair and Wizz Air fly, written once a week by the cron
// (/api/cron/route-graph). The destination picker and the searches read it instead of asking the airlines.
test.describe("route graph's cron", () => {
  test("only Vercel Cron may call it: without its secret, 401", async ({ request }) => {
    expect((await request.get("/api/cron/route-graph")).status()).toBe(401);
    const wrong = await request.get("/api/cron/route-graph", { headers: { authorization: "Bearer wrong" } });
    expect(wrong.status()).toBe(401);
  });

  // Real routes from the airlines, so @live
  test("it writes every airline's routes, and Malta's destinations come from them @live", async ({ request }) => {
    test.skip(!process.env.CRON_SECRET, "CRON_SECRET is not set (.env.local)");
    const response = await request.get("/api/cron/route-graph", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
    expect(response.status()).toBe(200);
    const { counts, kept } = await response.json();
    expect(kept).toEqual([]);
    expect(counts.ryanair).toBeGreaterThan(2000);
    expect(counts.wizz).toBeGreaterThan(1000);

    const destinations = await (await request.get("/api/destinations?origin=MLA&lang=es")).json();
    expect(destinations.failed).toEqual([]);
    const rome = destinations.destinations.find((destination) => destination.code === "FCO");
    expect(rome).toMatchObject({ city: "Roma", country: "Italia", countryCode: "IT" });
    expect(rome.airlines).toEqual(expect.arrayContaining(["ryanair", "wizz"]));
  });
});
