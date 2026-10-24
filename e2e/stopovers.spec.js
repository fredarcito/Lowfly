import { combineLegs } from "../src/server/stopovers/combine.js";
import { connects, connectionMinutes, isGetaway, stayMinutes, zoneOf } from "../src/server/stopovers/connection.js";
import { DESKTOP, expect, openWith, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// Stopovers (docs/stopovers.md): trips through a hub on separate tickets, as a same-day connection or a few nights
// in the hub. The joining rules on fixed flights, then a real search (@live).

const MALTA = { code: "MLA", city: "Malta", countryCode: "MT", tz: "Europe/Malta", lat: 35.86, lon: 14.48 };
const ROME = { code: "FCO", city: "Roma", countryCode: "IT", tz: "Europe/Rome", lat: 41.8, lon: 12.24 };
const ROME_CIAMPINO = { code: "CIA", city: "Roma", countryCode: "IT", tz: "Europe/Rome", lat: 41.8, lon: 12.59 };
// Wizz Air airports come without a time zone: their country's
const SARAJEVO = { code: "SJJ", city: "Sarajevo", countryCode: "BA", lat: 43.82, lon: 18.33 };
const AIRPORTS = new Map([MALTA, ROME, ROME_CIAMPINO, SARAJEVO].map((airport) => [airport.code, airport]));

const DAY = "2026-11-12";
// Ryanair: the day's cheapest flight with its arrival
const ryanair = (from, to, time, arrive, price = 20, day = DAY) => ({ from, to, day, time, arrive, price, airline: "ryanair" });
// Wizz Air: every departure of the day, no arrival, a price that may be any of them
const wizz = (from, to, times, price = 30, day = DAY) => ({ from, to, day, time: times[0], times, price, airline: "wizz" });

test.describe("stopovers: same-day connection", () => {
  test("Ryanair lands 15:15, Wizz leaves 19:05: 230 minutes, it connects", () => {
    const arriving = ryanair("MLA", "FCO", "13:40", "15:15");
    const departing = wizz("FCO", "SJJ", ["19:05"]);
    expect(connectionMinutes(arriving, departing, AIRPORTS)).toBe(230);
    expect(connects(arriving, departing, AIRPORTS)).toBe(true);
  });

  test("less than 2.5 hours to get out and check in again: no", () => {
    expect(connects(ryanair("MLA", "FCO", "13:40", "15:15"), wizz("FCO", "SJJ", ["17:30"]), AIRPORTS)).toBe(false);
  });

  test("another airport of the city: never the same day", () => {
    expect(connects(ryanair("MLA", "FCO", "06:00", "07:35"), wizz("CIA", "SJJ", ["19:05"]), AIRPORTS)).toBe(false);
  });

  test("Wizz with several flights a day: every one of them must make it", () => {
    const arriving = ryanair("MLA", "FCO", "06:00", "07:35");
    expect(connects(arriving, wizz("FCO", "SJJ", ["11:00", "19:05"]), AIRPORTS)).toBe(true);
    expect(connects(arriving, wizz("FCO", "SJJ", ["09:00", "19:05"]), AIRPORTS)).toBe(false);
  });

  test("a Wizz arrival is estimated from the distance, from its latest departure", () => {
    // Sarajevo → Rome (~500 km): about 1 h 13 min plus a margin, with Sarajevo's time zone from its country
    expect(zoneOf(SARAJEVO)).toBe("Europe/Sarajevo");
    const minutes = connectionMinutes(wizz("SJJ", "FCO", ["10:00"]), ryanair("FCO", "MLA", "15:00", "16:35"), AIRPORTS);
    expect(minutes).toBeGreaterThan(180);
    expect(minutes).toBeLessThan(240);
  });

  test("a price from recent searches (not live) is never joined the same day", () => {
    const cached = { ...ryanair("MLA", "FCO", "06:00", "07:35"), airline: "easyjet", cached: true };
    expect(connects(cached, wizz("FCO", "SJJ", ["19:05"]), AIRPORTS)).toBe(false);
  });
});

// A getaway is a whole day or more in the hub's city; a night with less is a long stop
test.describe("stopovers: getaway or long stop", () => {
  test("landing at 23:10 and leaving at 05:50: a night of 6 h 40 min, a long stop", () => {
    const arriving = ryanair("MLA", "FCO", "21:00", "23:10", 20, "2026-12-12");
    const departing = ryanair("FCO", "MLA", "05:50", "07:25", 20, "2026-12-13");
    expect(stayMinutes(arriving, departing, AIRPORTS)).toBe(400);
    expect(isGetaway(arriving, departing, 1, AIRPORTS)).toBe(false);
  });

  test("landing at 07:55 and leaving two days later at 17:55: 58 h, a getaway", () => {
    const arriving = ryanair("MLA", "FCO", "06:00", "07:55", 20, "2026-12-12");
    const departing = wizz("FCO", "SJJ", ["17:55"], 20, "2026-12-14");
    expect(stayMinutes(arriving, departing, AIRPORTS)).toBe(58 * 60);
    expect(isGetaway(arriving, departing, 2, AIRPORTS)).toBe(true);
  });

  test("with the times unknown, one night is a long stop and two nights a getaway", () => {
    const noTimes = (day) => ({ from: "MLA", to: "FCO", day, time: "", price: 20, airline: "easyjet", cached: true });
    const departing = (day) => ({ ...noTimes(day), from: "FCO", to: "SJJ" });
    expect(isGetaway(noTimes("2026-12-12"), departing("2026-12-13"), 1, new Map())).toBe(false);
    expect(isGetaway(noTimes("2026-12-12"), departing("2026-12-14"), 2, new Map())).toBe(true);
  });
});

test.describe("stopovers: joining the legs", () => {
  const sameCity = (previous, next) => AIRPORTS.get(previous.to).city === AIRPORTS.get(next.from).city;

  test("for each first flight, the cheapest way to finish within the nights allowed", () => {
    const toRome = [ryanair("MLA", "FCO", "08:00", "09:35", 15, "2026-11-10"), ryanair("MLA", "FCO", "08:00", "09:35", 25, "2026-11-11")];
    const toSarajevo = [
      wizz("FCO", "SJJ", ["19:05"], 40, "2026-11-11"),
      wizz("FCO", "SJJ", ["19:05"], 20, "2026-11-13"),
      // Four nights after the 10th: too long a stop
      wizz("FCO", "SJJ", ["19:05"], 10, "2026-11-14"),
    ];
    const trips = combineLegs([toRome, toSarajevo], [{ min: 1, max: 3 }], sameCity);
    expect(trips.map((trip) => [trip.legs[0].day, trip.legs[1].day, trip.price])).toEqual([
      ["2026-11-10", "2026-11-13", 35],
      ["2026-11-11", "2026-11-14", 35],
    ]);
  });

  test("after a night, another airport of the same city is fine", () => {
    const trips = combineLegs(
      [[ryanair("MLA", "FCO", "08:00", "09:35", 15, "2026-11-10")], [wizz("CIA", "SJJ", ["19:05"], 20, "2026-11-12")]],
      [{ min: 1, max: 3 }],
      sameCity
    );
    expect(trips).toHaveLength(1);
  });

  test("a whole return trip: four legs, nights at the hub, at the destination and on the way back", () => {
    const legs = [
      [ryanair("MLA", "FCO", "08:00", "09:35", 15, "2026-11-10")],
      [wizz("FCO", "SJJ", ["19:05"], 20, "2026-11-11")],
      [wizz("SJJ", "FCO", ["21:10"], 21, "2026-11-16"), wizz("SJJ", "FCO", ["21:10"], 5, "2026-11-25")],
      [ryanair("FCO", "MLA", "22:25", "23:55", 15, "2026-11-17")],
    ];
    const trips = combineLegs(legs, [{ min: 1, max: 3 }, { min: 4, max: 7 }, { min: 0, max: 1 }], sameCity);
    // The return of the 25th is cheaper but stays 14 nights
    expect(trips).toHaveLength(1);
    expect(trips[0].price).toBe(71);
    expect(trips[0].legs.map((leg) => leg.day)).toEqual(["2026-11-10", "2026-11-11", "2026-11-16", "2026-11-17"]);
  });
});

// A real search at Ryanair and Wizz: slow, and it depends on the airlines answering
test.describe("stopovers @live", () => {
  test("Malta to Bosnia, with no direct flight: trips through a hub", async ({ request }) => {
    test.setTimeout(120_000);
    const params = new URLSearchParams({ origin: "MLA", country: "Bosnia y Herzegovina", from: dayFromNow(14), to: dayFromNow(44), lang: "es" });
    const response = await request.get(`/api/stopovers?${params}`, { timeout: 110_000 });
    expect(response.status()).toBe(200);
    const { trips, hubs, failed } = await response.json();
    expect(failed).toEqual([]);
    expect(hubs.length).toBeGreaterThan(0);
    expect(trips.length).toBeGreaterThan(0);
    for (const trip of trips) {
      expect(trip.legs[0].from).toBe("MLA");
      expect(["SJJ", "TZL", "BNX", "OMO"]).toContain(trip.legs[1].to);
      expect(trip.price).toBeCloseTo(trip.legs.reduce((total, leg) => total + leg.price, 0), 2);
      if (trip.kind === "connection") expect(trip.via.minutes).toBeGreaterThanOrEqual(150);
      else expect(trip.via.nights).toBeGreaterThanOrEqual(1);
    }
  });
});

// The search: places reached only with a stop are offered, and searching one asks for the trips through a hub
// instead of telling there are no flights
test.describe("stopovers in the search @live", () => {
  // The direct search answers 404 (no direct flight there), which the browser logs
  test.use({ expectedErrors: /status of 404/ });

  test("from Malta, Bosnia is offered with a stop, and its search asks for the trips through a hub", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es", { origin: "MLA" });
    await page.getByRole("tab", { name: /destino/i }).click();
    await expect(page.locator("#country")).toBeEnabled({ timeout: 60_000 });
    await page.locator("#country").click();
    await page.locator('input[role="combobox"]').fill("bosnia");
    const bosnia = page.getByRole("option", { name: /Bosnia y Herzegovina/ });
    await expect(bosnia).toContainText("Con escala");
    await bosnia.click();
    await expect(page.locator("#country")).toContainText("Bosnia");

    const stopovers = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/stopovers", { timeout: 110_000 });
    await page.getByRole("button", { name: /^Buscar/ }).click();
    const answer = await stopovers;
    expect(answer.status()).toBe(200);
    expect((await answer.json()).trips.length).toBeGreaterThan(0);
    // No direct flight, but trips through a hub: not the "no flights" error
    await expect(page.getByText(/No hay vuelos desde/)).toHaveCount(0);
    await expect(page.getByText("No hay vuelo directo a Bosnia y Herzegovina: estos son los viajes con escala.")).toBeVisible();
    // The highlighted trip: what it is, the way through the hub, separate tickets, a "Buy" for each flight
    const highlighted = page.locator("main").getByRole("heading", { level: 2 }).first();
    await expect(highlighted).toHaveText(/^(Sarajevo|Tuzla) con (\d+ días en|escala en) .+/);
    await expect(page.getByText(/billetes separados/).filter({ visible: true }).first()).toBeVisible();
    expect(await page.getByRole("link", { name: /→ .* en (Ryanair|Wizz Air)/ }).count()).toBeGreaterThan(1);
    // A getaway leads to the planner with every town of the trip
    const plan = page.getByRole("link", { name: /^Te armamos el itinerario día a día de / });
    if (await plan.count()) {
      await expect(plan).toHaveAttribute("href", /\/es\/trips\/new\?stops=/);
    }
    // The list of trips with a stop: a row opens its flights
    const list = page.locator("section").filter({ has: page.getByRole("heading", { name: "Viajes con escala" }) });
    const row = list.locator("button[aria-expanded]").first();
    await row.click();
    await expect(row).toHaveAttribute("aria-expanded", "true");
    await expect(list.getByRole("link", { name: /→ .* en (Ryanair|Wizz Air)/ }).first()).toBeVisible();
  });
});

// A trip through a hub leads to the planner with every town, its days and its flights' times (rounded to the form's
// half hours: arriving later, leaving earlier)
test.describe("stopovers into the planner", () => {
  test("?stops= fills every town with its dates and times", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const stops = `ZAG,${dayFromNow(30)},07:55,${dayFromNow(32)},17:55;BSL,${dayFromNow(32)},19:30,${dayFromNow(34)},07:50`;
    await openWith(page, `/es/trips/new?stops=${encodeURIComponent(stops)}`);
    const cards = page.locator("form section ol > li");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("Zagreb");
    await expect(cards.nth(1)).toContainText("Basilea");
    await expect(cards.nth(0)).toContainText("Llegas 08:00 · sales 17:30");
    await expect(cards.nth(1)).toContainText("Llegas 19:30 · sales 07:30");
  });
});

// A getaway through a hub, as /api/stopovers answers it, `days` from now: Malta → Zagreb (2 nights) → Basel
// (2 nights) → Zagreb (1 night) → Malta, all with Ryanair
const getawayTrip = (days) => {
  const day = (offset) => dayFromNow(days + offset);
  const leg = (from, to, offset, time, arrive, price) => ({ from, to, day: day(offset), time, arrive, price, cur: "EUR", airline: "ryanair" });
  return {
    kind: "escapada",
    price: 75.69,
    cur: "EUR",
    day: day(0),
    code: "BSL",
    city: "Basilea",
    country: "Suiza",
    via: { city: "Zagreb", country: "Croacia", nights: 2 },
    nights: 2,
    legs: [
      leg("MLA", "ZAG", 0, "06:00", "07:55", 14.99),
      leg("ZAG", "BSL", 2, "17:55", "19:30", 20.72),
      leg("BSL", "ZAG", 4, "07:50", "09:20", 19.99),
      leg("ZAG", "MLA", 5, "18:30", "20:30", 19.99),
    ],
    stops: [
      { code: "ZAG", city: "Zagreb", nights: 2, minutes: 3480, type: "stay" },
      { code: "BSL", city: "Basilea", nights: 2, minutes: 2180, type: "stay" },
      { code: "ZAG", city: "Zagreb", nights: 1, minutes: 1990, type: "stay" },
    ],
  };
};

// The highlighted getaway, saved: "My trips" keeps it with its towns and shows its flights, each with its "Buy"
test.describe("a getaway, saved", () => {
  // The direct search answers 404 (no direct flight there), which the browser logs
  test.use({ expectedErrors: /status of 404/ });

  test("from the search to My trips, with its towns and its four flights", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.route("**/api/country?**", (route) =>
      route.fulfill({ status: 404, json: { error: "noRoutes", params: { origin: "MLA", country: "Suiza" } } })
    );
    await page.route("**/api/stopovers?**", (route) =>
      // A pricier same-day kind too, so the chips show and the cheapest is the one picked
      route.fulfill({
        json: { origin: "MLA", country: "Suiza", city: null, trips: [getawayTrip(30), { ...getawayTrip(31), kind: "connection", price: 99 }], hubs: [], failed: [] },
      })
    );
    await openWith(page, `/es?m=country&o=MLA&c=Suiza&from=${dayFromNow(20)}&to=${dayFromNow(50)}&trip=return&min=2&maxn=4`, { origin: "MLA" });

    const card = page.locator("main").getByRole("heading", { name: "Basilea con 3 días en Zagreb" }).locator("xpath=ancestor::*[@data-slot='card'][1]");
    await expect(card).toBeVisible();
    await expect(card.getByText("Tu visita a Zagreb")).toBeVisible();
    // The kind's chip names the city to see on the way
    await expect(page.getByRole("radio", { name: /Conoce Zagreb de paso/ })).toHaveAttribute("aria-checked", "true");
    await expect(card.getByRole("link", { name: "Te armamos el itinerario día a día de Zagreb y Basilea" })).toHaveAttribute("href", /\/es\/trips\/new\?stops=ZAG/);
    await expect(card.getByRole("link", { name: /→ .* en Ryanair/ })).toHaveCount(4);
    await card.getByRole("button", { name: "Guardar viaje" }).filter({ visible: true }).click();
    await expect(card.getByRole("link", { name: "Prepárame el itinerario" }).filter({ visible: true })).toBeVisible();

    await card.getByRole("link", { name: "Prepárame el itinerario" }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/es\/trips\?id=stopover-mla-/);
    await expect(page.getByText("Tus 4 vuelos")).toBeVisible();
    await expect(page.getByRole("link", { name: /→ .* en Ryanair/ })).toHaveCount(4);
    for (const city of ["Zagreb", "Basilea"]) await expect(page.locator("main").getByText(city).first()).toBeVisible();
  });
});

// Flexible dates to a place with no direct flight: the trips through a hub in the days they allow, not an error
test.describe("stopovers on flexible dates @live", () => {
  // The direct search answers 404 (no direct flight there), which the browser logs
  test.use({ expectedErrors: /status of 404/ });

  test("Madrid to Bosnia, ±2 days: the destination says it is with a stop, and the trips show", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(DESKTOP);
    const [ida, vuelta] = [dayFromNow(30), dayFromNow(33)];
    const stopovers = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/stopovers", { timeout: 110_000 });
    await openWith(page, `/es?m=trip&o=MAD&c=Bosnia%20y%20Herzegovina&ida=${ida}&vuelta=${vuelta}&flex=2`, { origin: "MAD" });
    const answer = await stopovers;
    const params = new URL(answer.url()).searchParams;
    expect(params.get("outTo")).toBe(dayFromNow(32));
    expect(params.get("backFrom")).toBe(dayFromNow(31));
    const { trips } = await answer.json();
    for (const trip of trips) {
      expect(trip.legs[0].day <= dayFromNow(32)).toBe(true);
      expect(trip.legs.at(-1).day >= dayFromNow(31)).toBe(true);
    }
    if (trips.length) await expect(page.getByText("No hay vuelo directo a Bosnia y Herzegovina: estos son los viajes con escala.")).toBeVisible();
    await page.getByRole("button", { name: /Editar/ }).click();
    await expect(page.getByText("Con escala desde Madrid")).toBeVisible();
  });
});

// "By airport" only when the place has several: with one it repeats the highlighted trip
test.describe("results by airport", () => {
  const directData = (airports) => {
    const fare = (code, city, price) => ({ code, city, country: "Albania", day: dayFromNow(30), time: "19:20", arrive: "22:25", airline: "ryanair", price, cur: "EUR" });
    const best = fare("TIA", "Tirana", 32.98);
    return {
      origin: "MAD", roundTrip: false, country: "Albania", city: null, from: dayFromNow(20), to: dayFromNow(40), months: [dayFromNow(30).slice(0, 7) + "-01"],
      byDay: { [best.day]: best }, best, others: [], airports: airports.map(([code, city, price]) => fare(code, city, price)), min: 32.98, max: 40, failed: [],
    };
  };
  for (const [name, airports, shown] of [
    ["one airport: hidden", [["TIA", "Tirana", 32.98]], 0],
    ["two airports: shown", [["TIA", "Tirana", 32.98], ["KSV", "Kukës", 40]], 1],
  ])
    test(name, async ({ page }) => {
      await page.route("**/api/country?**", (route) => route.fulfill({ json: directData(airports) }));
      await page.route("**/api/stopovers?**", (route) => route.fulfill({ json: { origin: "MAD", country: "Albania", city: null, trips: [], hubs: [], failed: [] } }));
      await openWith(page, `/es?m=country&o=MAD&c=Albania&from=${dayFromNow(20)}&to=${dayFromNow(40)}&trip=oneway`, { origin: "MAD" });
      await expect(page.locator("main").getByRole("heading", { name: "Tirana, Albania" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Por aeropuerto" })).toHaveCount(shown);
    });
});
