import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, openWith, test } from "./helpers/test.js";
import { flightTrip, manualTrip, romeTrip } from "./helpers/trips.js";

// My trips: the list, a trip's page (photo header, flights, itinerary) and creating its itinerary
test.describe("my trips", () => {
  test("the list shows each trip with its state", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es/trips", { trips: [flightTrip({ inDays: 1, booked: true })] });
    const card = page.locator("article").first();
    await expect(card).toContainText("Catania");
    await expect(card).toContainText("Reservado");
  });

  for (const theme of ["dark", "light"]) {
    for (const viewport of [DESKTOP, PHONE]) {
      test(`a trip's photo header (${theme}, ${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        const trip = romeTrip();
        await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip], theme });
        await expect(page.getByRole("heading", { level: 1 })).toContainText("Roma");
        // Why go: the destination guide, with its source
        await expect(page.getByText("Fuente").first()).toBeVisible({ timeout: 30_000 });
        await expectNoSidewaysScroll(page);
      });
    }
  }

  for (const booked of [false, true]) {
    for (const viewport of [DESKTOP, PHONE]) {
      test(`the flights card (${booked ? "booked" : "not booked"}, ${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        const trip = flightTrip({ booked });
        await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
        const flights = page.locator("section").filter({ hasText: "Vuelos:" }).first();
        // Booking stays in sight until it is booked
        await expect(flights.getByRole("link", { name: /Reservar en Ryanair/ })).toHaveCount(booked ? 0 : 1);
        await flights.getByRole("button", { name: /Ver detalles de los vuelos/ }).click();
        await expect(flights.getByText(/¿Ya reservaste/)).toBeVisible();
      });
    }
  }

  test("phones: the slim bar shows once the header scrolls away; desktop never shows it", async ({ browser }) => {
    const trip = romeTrip();
    for (const viewport of [PHONE, DESKTOP]) {
      const context = await browser.newContext({ viewport, isMobile: viewport === PHONE, hasTouch: viewport === PHONE });
      const page = await context.newPage();
      await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
      const bar = page.locator(".fixed.inset-x-0.top-0");
      await expect(page.getByRole("tab", { name: /Día 1/ })).toBeVisible();
      await expect(bar).toHaveAttribute("aria-hidden", "true");
      await page.mouse.wheel(0, 1300);
      if (viewport === PHONE) await expect(bar).not.toHaveAttribute("aria-hidden", "true");
      else await expect(bar).toBeHidden();
      // The day tabs stick at the top
      await expect.poll(() => page.getByRole("tablist").evaluate((tabs) => Math.round(tabs.getBoundingClientRect().top))).toBeLessThan(80);
      await expectNoSidewaysScroll(page);
      await context.close();
    }
  });

  test("creating the itinerary: check-in only for flights", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const flight = flightTrip({ id: "flight-test" });
    const manual = manualTrip({ id: "manual-test" });
    await openWith(page, `/es/trips?id=${flight.id}`, { trips: [flight, manual] });
    const createCard = () => page.locator("section").filter({ hasText: "Crear itinerario" }).last();
    await expect(createCard().getByText("Check-in")).toBeVisible();
    await page.goto(`/es/trips?id=${manual.id}`);
    await expect(createCard()).toBeVisible();
    await expect(createCard().getByText("Check-in")).toHaveCount(0);
  });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`the loader while the AI makes the itinerary (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      // The AI never answers: the loader stays
      await page.route("**/api/itinerary", () => {});
      const trip = flightTrip({ id: "loader-test", inDays: 10 });
      await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
      await page.getByRole("button", { name: /Crear itinerario/ }).click();
      const loader = page.locator("section[role=status]");
      await expect(loader).toBeVisible();
      await expect(loader).toContainText("no cierres esta página");
    });
  }

  test("a past trip still opens", async ({ page }) => {
    const trip = flightTrip({ id: "past-test", inDays: -10 });
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Catania");
  });

  // A trip planned by hand anywhere (no airport of ours nearby): the first town's photo, from Wikipedia
  test("a trip planned by hand shows its first town's photo @live", async ({ page }) => {
    const trip = manualTrip({ id: "colombia-test" });
    trip.stops = [
      { ...trip.stops[0], city: "Cúcuta", country: "Colombia", countryCode: "CO", lat: 7.89391, lng: -72.50782, code: null },
      { ...trip.stops[1], city: "Pamplona", country: "Colombia", countryCode: "CO", lat: 7.37565, lng: -72.64795, code: null },
    ];
    trip.fare = { ...trip.fare, code: null, city: "Cúcuta → Pamplona", country: "Colombia" };
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
    await expect(page.locator("header img[src*='wikimedia']").first()).toHaveAttribute("src", /C%C3%BAcuta/, { timeout: 30_000 });
    await page.goto("/es/trips");
    await expect(page.locator("article img[src*='wikimedia']").first()).toBeVisible({ timeout: 30_000 });
  });

  // A day out of town says where, and how long it takes to get there
  test("a day trip is marked on its day", async ({ page }) => {
    const trip = romeTrip();
    // Day 2 is a trip to Tivoli; its third and fourth stops are there
    trip.itinerary = {
      ...trip.itinerary,
      days: trip.itinerary.days.map((day, index) =>
        index === 1
          ? { ...day, excursion: { town: "Tivoli", travelMinutes: 50 }, stops: day.stops.map((stop, stopIndex) => (stopIndex === 2 || stopIndex === 3 ? { ...stop, excursion: true } : stop)) }
          : day
      ),
    };
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
    await expect(page.getByText("Excursión a Tivoli")).toHaveCount(0);
    await page.getByRole("tab", { name: /Día 2/ }).click();
    await expect(page.getByText("Excursión a Tivoli · 50 min por trayecto")).toBeVisible();
    // A signpost beside each stop of the trip, and only those
    await expect(page.locator('[role="tabpanel"] li').getByText("Parte de la excursión a Tivoli")).toHaveCount(2);
  });
});
