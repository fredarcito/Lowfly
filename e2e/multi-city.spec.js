import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { possibleOptions, stopsInDirection } from "../src/server/multiCity/possible.js";
import { seasonWindow, shareNights, stayRange } from "../src/server/multiCity/fit.js";
import { pickCandidates, rankRoutes } from "../src/server/multiCity/rank.js";
import { plannerTownsOf, savedTownsOf, townDaysOf } from "../src/utils/multiCity.js";
import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, openWith, savedTrips, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// Multi-city routes (docs/multi-city.md): routes we wrote, flown into one city and home from another, the towns
// between by land. The rules on fixed data, the routes' data itself, the "Recorridos" search with its API answered
// here, and a real search (@live).

// Every route as written (src/data/multiCity/*.json)
const ROUTES = readdirSync(join(process.cwd(), "src/data/multiCity"))
  .filter((name) => name.endsWith(".json"))
  .flatMap((name) => Object.entries(JSON.parse(readFileSync(join(process.cwd(), "src/data/multiCity", name), "utf8"))))
  .map(([id, route]) => ({ id, ...route }));

const town = (city, codes, min, ideal, land) => ({ city: { es: city, en: city }, countryCode: "IT", lat: 41, lng: 12, codes, nights: { min, ideal }, ...(land && { land }) });
const VENICE = town("Venecia", ["VCE"], 2, 2, { minutes: 90, by: "train" });
const BOLOGNA = town("Bolonia", ["BLQ"], 1, 1, { minutes: 40, by: "train" });
const FLORENCE = town("Florencia", [], 2, 3, { minutes: 95, by: "train" });
const ROME = town("Roma", ["FCO", "CIA"], 2, 3);
const ITALY = { id: "italia", kind: "classic", countries: ["IT"], months: [4, 5], reversible: true, versions: { full: { stops: [VENICE, BOLOGNA, FLORENCE, ROME] } } };

test.describe("multi-city: the rules", () => {
  test("done backwards, each town keeps the way by land to the next one", () => {
    const reversed = stopsInDirection(ITALY.versions.full.stops, "reverse");
    expect(reversed.map((stop) => stop.city.es)).toEqual(["Roma", "Florencia", "Bolonia", "Venecia"]);
    // Rome → Florence is the Florence → Rome leg; Venice, now last, has none
    expect(reversed.map((stop) => stop.land?.minutes ?? null)).toEqual([95, 40, 90, null]);
    expect(reversed.map((stop) => stop.index)).toEqual([3, 2, 1, 0]);
  });

  test("a route can be flown when the origin flies to its first town and home from its last", () => {
    const graph = { MLA: { VCE: ["ryanair"], FCO: ["ryanair"] }, FCO: { MLA: ["ryanair"] }, VCE: {} };
    const options = possibleOptions("MLA", [ITALY], graph);
    // Into Venice and home from Rome; backwards (into Rome) there is no flight home from Venice
    expect(options.map((option) => [option.direction, option.entry.map((airport) => airport.code), option.exit.map((airport) => airport.code)])).toEqual([
      ["forward", ["VCE"], ["FCO"]],
    ]);
  });

  test("a version fits from its minimum nights (and two under its ideal), up to two over its ideal", () => {
    const stops = ITALY.versions.full.stops; // minimum 7, ideal 9
    expect(stayRange(stops, 6)).toBeNull();
    expect(stayRange(stops, 8)).toEqual({ min: 7, max: 8 });
    expect(stayRange(stops, 14)).toEqual({ min: 7, max: 11 });
  });

  test("the nights go first to each town's minimum, then to the towns furthest below their ideal", () => {
    const stops = ITALY.versions.full.stops;
    expect(shareNights(stops, 7)).toEqual([2, 1, 2, 2]);
    expect(shareNights(stops, 9)).toEqual([2, 1, 3, 3]);
    // Past every ideal, to the towns with the most ideal nights
    expect(shareNights(stops, 10)).toEqual([2, 1, 4, 3]);
    expect(shareNights(stops, 6)).toBeNull();
  });

  test("a seasonal route only within its days, also across the new year", () => {
    const christmas = { season: { from: "11-28", to: "12-23" } };
    expect(seasonWindow(christmas, "2026-11-20", "2026-12-02")).toEqual({ from: "2026-11-28", to: "2026-12-02" });
    expect(seasonWindow(christmas, "2026-10-01", "2026-10-10")).toBeNull();
    const winter = { season: { from: "11-28", to: "01-04" } };
    expect(seasonWindow(winter, "2027-01-01", "2027-01-10")).toEqual({ from: "2027-01-01", to: "2027-01-04" });
    expect(seasonWindow({}, "2026-10-01", "2026-10-10")).toEqual({ from: "2026-10-01", to: "2026-10-10" });
  });

  test("the routes priced are the cheapest to fly into, with the seasonal ones and a surprise among them", () => {
    const route = (id, kind, extra = {}) => ({ id, kind, countries: ["IT"], months: [], ...extra });
    const candidates = [
      { route: route("a", "classic"), entryPrice: 10 },
      { route: route("b", "classic"), entryPrice: 12 },
      { route: route("c", "classic"), entryPrice: 14 },
      { route: route("surprise", "surprise"), entryPrice: 90 },
      { route: route("christmas", "classic", { season: { from: "11-28", to: "12-23" } }), entryPrice: 95 },
      { route: route("unknown", "classic"), entryPrice: Infinity },
    ];
    const picked = pickCandidates(candidates, { limit: 4, month: 12, homeCountry: "MT" }).map((chosen) => chosen.id);
    expect(picked).toHaveLength(4);
    expect(picked).toEqual(expect.arrayContaining(["christmas", "surprise", "a"]));
    expect(picked).not.toContain("unknown");
  });

  test("a surprise is always among the first three results", () => {
    const result = (id, kind, price, country) => ({ route: { id, kind, countries: [country], months: [] }, trips: [{ price, nights: 7, idealNights: 7 }] });
    const ranked = rankRoutes([result("a", "classic", 10, "IT"), result("b", "classic", 11, "FR"), result("c", "classic", 12, "ES"), result("d", "surprise", 50, "AL")], {
      month: 5,
      homeCountry: "MT",
    });
    expect(ranked.slice(0, 3).map((item) => item.route.id)).toContain("d");
  });
});

// The routes as written: the search counts on all of this
test.describe("multi-city: the routes' data", () => {
  test("every version flies in and home from a town with an airport, with nights and ways by land", () => {
    expect(ROUTES.length).toBeGreaterThan(50);
    for (const route of ROUTES)
      for (const [version, { stops }] of Object.entries(route.versions)) {
        const where = `${route.id}/${version}`;
        expect(["short", "full", "long"], where).toContain(version);
        expect(stops.length, where).toBeGreaterThanOrEqual(2);
        expect(stops[0].codes.length, `${where}: first town`).toBeGreaterThan(0);
        expect(stops.at(-1).codes.length, `${where}: last town`).toBeGreaterThan(0);
        stops.forEach((stop, index) => {
          expect(stop.nights.min, `${where} ${stop.city.es}`).toBeLessThanOrEqual(stop.nights.ideal);
          expect(Boolean(stop.land), `${where} ${stop.city.es}: land to the next`).toBe(index < stops.length - 1);
        });
        // The planner takes the towns of any route (constants/manualTrips MAX_STOPS)
        expect(stops.length, where).toBeLessThanOrEqual(9);
      }
  });
});

// A trip of "Puglia y Matera" as /api/multi-city answers it, `days` from now: into Bari, Matera (no airport) and
// Alberobello by land, home from Lecce's airport (Brindisi)
const pugliaTrip = (days, version = "short") => {
  const day = (offset) => dayFromNow(days + offset);
  const nights = version === "short" ? 5 : 8;
  const towns =
    version === "short"
      ? [
          { ref: "puglia-y-matera/short/0", city: "Bari", country: "Italia", countryCode: "IT", lat: 41.1171, lng: 16.8719, code: "BRI", nights: 1, land: { minutes: 90, by: "train" } },
          { ref: "puglia-y-matera/short/1", city: "Matera", country: "Italia", countryCode: "IT", lat: 40.6664, lng: 16.6043, code: null, nights: 2, land: { minutes: 50, by: "car" } },
          { ref: "puglia-y-matera/short/2", city: "Alberobello", country: "Italia", countryCode: "IT", lat: 40.7843, lng: 17.2366, code: null, nights: 1, land: { minutes: 100, by: "train" } },
          { ref: "puglia-y-matera/short/3", city: "Lecce", country: "Italia", countryCode: "IT", lat: 40.3515, lng: 18.175, code: "BDS", nights: 1 },
        ]
      : [
          { ref: "puglia-y-matera/full/0", city: "Bari", country: "Italia", countryCode: "IT", lat: 41.1171, lng: 16.8719, code: "BRI", nights: 1, land: { minutes: 90, by: "train" } },
          { ref: "puglia-y-matera/full/1", city: "Matera", country: "Italia", countryCode: "IT", lat: 40.6664, lng: 16.6043, code: null, nights: 2, land: { minutes: 50, by: "car" } },
          { ref: "puglia-y-matera/full/2", city: "Alberobello", country: "Italia", countryCode: "IT", lat: 40.7843, lng: 17.2366, code: null, nights: 1, land: { minutes: 30, by: "bus" } },
          { ref: "puglia-y-matera/full/3", city: "Polignano a Mare", country: "Italia", countryCode: "IT", lat: 40.9962, lng: 17.2186, code: null, nights: 1, land: { minutes: 40, by: "train" } },
          { ref: "puglia-y-matera/full/4", city: "Ostuni", country: "Italia", countryCode: "IT", lat: 40.7296, lng: 17.5777, code: null, nights: 1, land: { minutes: 60, by: "train" } },
          { ref: "puglia-y-matera/full/5", city: "Lecce", country: "Italia", countryCode: "IT", lat: 40.3515, lng: 18.175, code: "BDS", nights: 2 },
        ];
  return {
    version,
    direction: "forward",
    price: version === "short" ? 41.98 : 47.98,
    cur: "EUR",
    day: day(0),
    nights,
    idealNights: nights,
    code: "BRI",
    city: "Bari",
    country: "Italia",
    legs: [
      { from: "MLA", to: "BRI", day: day(0), time: "09:10", arrive: "10:30", price: 19.99, cur: "EUR", airline: "ryanair" },
      { from: "BDS", to: "MLA", day: day(nights), time: "18:40", arrive: "19:55", price: version === "short" ? 21.99 : 27.99, cur: "EUR", airline: "ryanair" },
    ],
    stops: [],
    towns,
  };
};

const pugliaRoute = (days) => ({
  id: "puglia-y-matera",
  kind: "classic",
  name: "Puglia y Matera",
  summary: "Trulli, cuevas y barroco del sur.",
  note: "De Matera a Alberobello no hay tren directo.",
  countries: ["Italia"],
  season: null,
  trips: [pugliaTrip(days, "short"), pugliaTrip(days, "full")],
});

const albaniaRoute = (days) => ({
  ...pugliaRoute(days),
  id: "albania",
  kind: "surprise",
  name: "Albania",
  summary: "Montañas, ciudades otomanas y la Riviera.",
  note: null,
  countries: ["Albania"],
  trips: [{ ...pugliaTrip(days, "short"), price: 55.5 }],
});

test.describe("multi-city: the towns' days", () => {
  test("each town from the day you land to the flight home, with the flights' times at both ends", () => {
    const trip = pugliaTrip(30);
    const towns = townDaysOf(trip);
    expect(towns.map((stop) => [stop.city, stop.arriveDay, stop.leaveDay])).toEqual([
      ["Bari", dayFromNow(30), dayFromNow(31)],
      ["Matera", dayFromNow(31), dayFromNow(33)],
      ["Alberobello", dayFromNow(33), dayFromNow(34)],
      ["Lecce", dayFromNow(34), dayFromNow(35)],
    ]);
    expect(towns[0].arriveTime).toBe("10:30");
    expect(towns.at(-1).leaveTime).toBe("18:40");
    // The planner gets Matera by its place in the route; a saved trip keeps where it is
    expect(plannerTownsOf(trip)[1].code).toBe("puglia-y-matera/short/1");
    expect(savedTownsOf(trip)[1]).toMatchObject({ city: "Matera", code: null, lat: 40.6664, arrive: { day: dayFromNow(31) } });
  });
});

// The "Recorridos" search, with its API answered here
test.describe("multi-city: the search", () => {
  const answer = (days) => ({ origin: "MLA", from: dayFromNow(days), to: dayFromNow(days + 9), routes: [pugliaRoute(days), albaniaRoute(days)], failed: [] });
  const searchPath = (days) => `/es?m=multiCity&o=MLA&from=${dayFromNow(days)}&to=${dayFromNow(days + 9)}`;
  const card = (page, name) => page.locator("main").getByRole("heading", { name }).locator("xpath=ancestor::*[@data-slot='card'][1]");

  test("the routes for the free days: towns, flights, lengths, the planner and saving it", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    let asked = null;
    await page.route("**/api/multi-city?**", (route) => {
      asked = new URL(route.request().url()).searchParams;
      return route.fulfill({ json: answer(30) });
    });
    await openWith(page, searchPath(30), { origin: "MLA" });

    await expect(page.getByRole("heading", { name: "Recorridos para tus días libres" })).toBeVisible();
    expect(asked.get("from")).toBe(dayFromNow(30));
    expect(asked.get("to")).toBe(dayFromNow(39));
    const puglia = card(page, "Puglia y Matera");
    // The longest length by default, the other one tap away
    await expect(puglia.getByText("Polignano a Mare")).toBeVisible();
    await expect(puglia.locator("li").filter({ hasText: "Matera" }).first()).toContainText("Matera · 2 noches");
    await expect(puglia.getByText(/47,98/).first()).toBeVisible();
    await puglia.getByRole("radio", { name: /6 días/ }).click();
    await expect(puglia.getByText("Polignano a Mare")).toHaveCount(0);
    await expect(puglia.getByText(/41,98/).first()).toBeVisible();

    // The itinerary: the planner with every town, Matera included (no airport)
    await expect(puglia.getByRole("link", { name: "Genera tu itinerario personalizado" })).toHaveAttribute("href", /\/es\/trips\/new\?stops=puglia-y-matera%2Fshort%2F0/);
    // The flights, each with its own "Buy"
    await puglia.getByRole("button", { name: "Ver los vuelos" }).click();
    await expect(puglia.getByRole("link", { name: /→ .* en Ryanair/ })).toHaveCount(2);
    await expect(puglia.getByText("De Matera a Alberobello no hay tren directo.")).toBeVisible();

    // The length filter
    await page.getByRole("radiogroup", { name: "Duración del recorrido" }).first().getByRole("radio", { name: "Una semana" }).click();
    await expect(card(page, "Albania")).toHaveCount(0);

    // Saved with its towns: My trips keeps every one, Matera too
    await page.getByRole("radiogroup", { name: "Duración del recorrido" }).first().getByRole("radio", { name: "Todos" }).click();
    await card(page, "Puglia y Matera").getByRole("button", { name: "Guardar viaje" }).click();
    await expect.poll(async () => (await savedTrips(page)).length).toBe(1);
    const [saved] = await savedTrips(page);
    expect(saved.stops.map((stop) => stop.city)).toEqual(["Bari", "Matera", "Alberobello", "Polignano a Mare", "Ostuni", "Lecce"]);
    expect(saved.flights.legs).toHaveLength(2);
  });

  test("the planner opens with every town of the route, those with no airport too", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const stops = [
      `puglia-y-matera/short/0,${dayFromNow(30)},10:30,${dayFromNow(31)},`,
      `puglia-y-matera/short/1,${dayFromNow(31)},,${dayFromNow(33)},`,
      `puglia-y-matera/short/2,${dayFromNow(33)},,${dayFromNow(34)},`,
      `puglia-y-matera/short/3,${dayFromNow(34)},,${dayFromNow(35)},18:40`,
    ].join(";");
    await openWith(page, `/es/trips/new?stops=${encodeURIComponent(stops)}`);
    const cards = page.locator("form section ol > li");
    await expect(cards).toHaveCount(4);
    for (const [index, city] of ["Bari", "Matera", "Alberobello", "Lecce"].entries()) await expect(cards.nth(index)).toContainText(city);
  });

  test("from 'A cualquier sitio' with a week: the same days as routes", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const fare = { airline: "ryanair", code: "BRI", city: "Bari", country: "Italia", day: dayFromNow(31), time: "09:10", arrive: "10:30", price: 19.99, cur: "EUR" };
    await page.route("**/api/everywhere?**", (route) => route.fulfill({ json: { origin: "MLA", roundTrip: false, weekend: false, results: [fare], failed: [] } }));
    await page.route("**/api/multi-city?**", (route) => route.fulfill({ json: answer(30) }));
    await openWith(page, `/es?m=everywhere&o=MLA&from=${dayFromNow(30)}&to=${dayFromNow(39)}&trip=oneway`, { origin: "MLA" });
    await page.getByRole("button", { name: "Ver recorridos con estas fechas" }).click();
    await expect(page.getByRole("heading", { name: "Recorridos para tus días libres" })).toBeVisible();
    await expect(page).toHaveURL(/m=multiCity/);
  });

  test("too few days: one city is better", async ({ request }) => {
    const params = new URLSearchParams({ origin: "MLA", from: dayFromNow(25), to: dayFromNow(27) });
    const response = await request.get(`/api/multi-city?${params}`);
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe("multiCityTooShort");
  });

  test("on a phone: the four kinds of search and a route's card fit the screen", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.route("**/api/multi-city?**", (route) => route.fulfill({ json: answer(30) }));
    await openWith(page, "/es", { origin: "MLA" });
    await expect(page.getByRole("tab")).toHaveCount(4);
    await page.getByRole("tab", { name: /Recorridos/ }).click();
    await expect(page.getByText("¿Qué días tienes libres?")).toBeVisible();
    await expectNoSidewaysScroll(page);
    await page.getByRole("button", { name: /^Buscar/ }).click();
    await expect(card(page, "Puglia y Matera")).toBeVisible();
    await expectNoSidewaysScroll(page);
  });
});

test.describe("multi-city @live", () => {
  test("from Malta, a week and a half: routes with real flights in and home", async ({ request }) => {
    test.setTimeout(120_000);
    const params = new URLSearchParams({ origin: "MLA", from: dayFromNow(25), to: dayFromNow(34), lang: "es" });
    const response = await request.get(`/api/multi-city?${params}`, { timeout: 110_000 });
    expect(response.status()).toBe(200);
    const { routes } = await response.json();
    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes)
      for (const trip of route.trips) {
        const [flightIn, flightHome] = trip.legs;
        expect(flightIn.from).toBe("MLA");
        expect(flightHome.to).toBe("MLA");
        expect(flightIn.day >= dayFromNow(25) && flightHome.day <= dayFromNow(34)).toBe(true);
        expect(trip.price).toBeCloseTo(flightIn.price + flightHome.price, 2);
        expect(trip.towns.reduce((total, stop) => total + stop.nights, 0)).toBe(trip.nights);
      }
  });
});
