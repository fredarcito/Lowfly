import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, openWith, savedTrips, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// The adults a search is for: the fares stay per person (the airlines are asked the same), the form, the address,
// the totals and the booking links carry the number

const NO_ROUTES = { origin: "MLA", routes: [], failed: [] };

// A getaway through a hub, as /api/stopovers answers it: Malta → Zagreb (2 nights) → Basel (2) → Zagreb (1) → Malta, all
// with Ryanair
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

test.describe("passengers", () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`the adults go from 1 to 6 and the search carries it (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.route("**/api/multi-city?**", (route) => route.fulfill({ json: NO_ROUTES }));
      await openWith(page, "/es/recorridos", { origin: "MLA" });
      const adults = page.getByRole("combobox", { name: "Número de adultos" });
      await expect(adults).toHaveValue("1");
      await expect(adults.locator("option")).toHaveCount(6);
      await expect(adults).toContainText("6 adultos");
      await adults.selectOption("4");
      if (viewport === PHONE) await expectNoSidewaysScroll(page);

      await page.getByRole("button", { name: /^Buscar/ }).click();
      await expect(page).toHaveURL(/\/es\/recorridos\?o=MLA&pax=4&from=/);
      // No routes: the form opens again, with the adults it was searched for
      await expect(adults).toHaveValue("4");
    });
  }

  test("a link with pax= fills the adults and asks the API the same as for one", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const asked = [];
    await page.route("**/api/multi-city?**", (route) => {
      asked.push(route.request().url());
      return route.fulfill({ json: NO_ROUTES });
    });
    await openWith(page, `/es/recorridos?o=MLA&pax=3&from=${dayFromNow(30)}&to=${dayFromNow(39)}`, { origin: "MLA" });
    const adults = page.getByRole("combobox", { name: "Número de adultos" });
    await expect(adults).toHaveValue("3");
    expect(asked.length).toBeGreaterThan(0);
    for (const url of asked) expect(url).not.toMatch(/pax|passengers/);

    // Out of range or not a number: one adult
    for (const pax of ["9", "0", "dos"]) {
      await openWith(page, `/es/recorridos?o=MLA&pax=${pax}&from=${dayFromNow(30)}&to=${dayFromNow(39)}`, { origin: "MLA" });
      await expect(adults).toHaveValue("1");
    }
  });

  // The direct search answers 404 (no direct flight there), which the browser logs
  test.describe("a getaway for two", () => {
    test.use({ expectedErrors: /status of 404/ });

    test("the total, the booking links for two, and the trip saved with them", async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.route("**/api/country?**", (route) =>
        route.fulfill({ status: 404, json: { error: "noRoutes", params: { origin: "MLA", country: "Suiza" } } })
      );
      await page.route("**/api/stopovers?**", (route) =>
        route.fulfill({ json: { origin: "MLA", country: "Suiza", city: null, trips: [getawayTrip(30)], hubs: [], failed: [] } })
      );
      await openWith(page, `/es?m=country&o=MLA&c=Suiza&pax=2&from=${dayFromNow(20)}&to=${dayFromNow(50)}&trip=return&min=2&maxn=4`, { origin: "MLA" });

      const card = page.locator("main").getByRole("heading", { name: "Basilea con 3 días en Zagreb" }).locator("xpath=ancestor::*[@data-slot='card'][1]");
      await expect(card).toBeVisible();
      // The group's price is the big one, the person's under it
      await expect(card.getByText(/151,38/).first()).toBeVisible();
      await expect(card.getByText("75,69 € c/u")).toBeVisible();
      // Each flight too: its price for the three, and the person's under it
      await expect(card.getByText("14,99 € c/u").first()).toBeVisible();
      await expect(card.getByText(/29,98/).first()).toBeVisible();
      const links = card.getByRole("link", { name: /→ .* en Ryanair/ });
      await expect(links).toHaveCount(4);
      for (const link of await links.all()) await expect(link).toHaveAttribute("href", /adults=2&teens=0/);

      await card.getByRole("button", { name: "Guardar viaje" }).filter({ visible: true }).click();
      await expect.poll(async () => (await savedTrips(page)).map((trip) => trip.passengers)).toEqual([2]);

      // The saved trip books for two as well
      await card.getByRole("link", { name: "Prepárame el itinerario" }).filter({ visible: true }).click();
      await expect(page).toHaveURL(/\/es\/trips\?id=stopover-mla-/);
      await expect(page.getByText("Tus 4 vuelos")).toBeVisible();
      const savedLinks = page.getByRole("link", { name: /→ .* en Ryanair/ });
      await expect(savedLinks).toHaveCount(4);
      for (const link of await savedLinks.all()) await expect(link).toHaveAttribute("href", /adults=2&teens=0/);
    });

    test("for one adult: no totals and no passengers on the saved trip", async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.route("**/api/country?**", (route) =>
        route.fulfill({ status: 404, json: { error: "noRoutes", params: { origin: "MLA", country: "Suiza" } } })
      );
      await page.route("**/api/stopovers?**", (route) =>
        route.fulfill({ json: { origin: "MLA", country: "Suiza", city: null, trips: [getawayTrip(30)], hubs: [], failed: [] } })
      );
      await openWith(page, `/es?m=country&o=MLA&c=Suiza&from=${dayFromNow(20)}&to=${dayFromNow(50)}&trip=return&min=2&maxn=4`, { origin: "MLA" });
      const card = page.locator("main").getByRole("heading", { name: "Basilea con 3 días en Zagreb" }).locator("xpath=ancestor::*[@data-slot='card'][1]");
      await expect(card).toBeVisible();
      await expect(card.getByText(/ c\/u/)).toHaveCount(0);
      for (const link of await card.getByRole("link", { name: /→ .* en Ryanair/ }).all()) await expect(link).toHaveAttribute("href", /adults=1&teens=0/);
      await card.getByRole("button", { name: "Guardar viaje" }).filter({ visible: true }).click();
      await expect.poll(async () => (await savedTrips(page)).length).toBe(1);
      expect((await savedTrips(page))[0]).not.toHaveProperty("passengers");
    });
  });
});
