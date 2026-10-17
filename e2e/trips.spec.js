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
        // Why go: the destination guide, with its source; its highlights as plain text, not pills
        await expect(page.getByText("Fuente").first()).toBeVisible({ timeout: 30_000 });
        await expect(page.locator("li.bg-selected")).toHaveCount(0);
        await expect(page.getByText(/\d+ noches/).first()).toBeVisible();
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
        // Under the itinerary; booking stays in sight until it is booked
        const itinerary = page.locator("section").filter({ hasText: "Crear itinerario" }).last();
        expect((await itinerary.boundingBox()).y).toBeLessThan((await flights.boundingBox()).y);
        await expect(flights.getByRole("link", { name: /Reservar en Ryanair/ })).toHaveCount(booked ? 0 : 1);
        await flights.getByRole("button", { name: /Ver detalles de los vuelos/ }).click();
        await expect(flights.getByText(/¿Ya reservaste/)).toBeVisible();
      });
    }
  }

  // The weather to expect, made with the itinerary: so nobody lands somewhere colder than they thought
  for (const viewport of [DESKTOP, PHONE]) {
    test(`the weather to expect on the trip (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const trip = romeTrip();
      await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
      const weather = page.getByRole("region", { name: "Qué tiempo esperar" });
      await expect(weather.getByText("8 a 17 °C · Lluvias ocasionales")).toBeVisible();
      // The usual climate of the month, not a forecast: on phones the month under the weather (and the note once
      // unfolded); on wider screens all in one line
      if (viewport === PHONE) await expect(weather.getByText("Clima habitual en noviembre", { exact: true })).toBeVisible();
      else await expect(weather.getByText("Clima típico, no es un pronóstico").filter({ visible: true })).toBeVisible();
      // The weather and the month each fit in one line (no extra lines)
      for (const line of await weather.locator("p").filter({ visible: true }).all()) expect((await line.boundingBox()).height).toBeLessThan(30);
      // Above the days
      expect((await weather.boundingBox()).y).toBeLessThan((await page.getByRole("tab", { name: /Día 1/ }).boundingBox()).y);
      // What it is like and what to pack, unfolded
      const pack = weather.getByRole("button", { name: "Qué llevar" });
      await expect(weather.getByText(/Ropa:/)).toBeHidden();
      await pack.click();
      await expect(pack).toHaveAttribute("aria-expanded", "true");
      await expect(weather.getByText(/Otoño suave/)).toBeVisible();
      await expect(weather.getByText("Ropa: una chaqueta ligera o un jersey para la noche.")).toBeVisible();
      await expect(weather.getByText("Imprescindibles: calzado cómodo y un paraguas plegable.")).toBeVisible();
      await expect(weather.getByText("Clima típico para estas fechas, no es un pronóstico.")).toBeVisible();
      await expectNoSidewaysScroll(page);
    });
  }

  test("an itinerary made before the weather was added has no weather card", async ({ page }) => {
    const { weather, ...olderItinerary } = romeTrip().itinerary;
    const trip = romeTrip({ itinerary: olderItinerary });
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
    await expect(page.getByRole("tab", { name: /Día 1/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Qué tiempo esperar" })).toHaveCount(0);
  });

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

  // Interests as chips in view; one-choice fields open the system's picker on phones, a menu on desktop.
  // The AI gets what was chosen.
  for (const viewport of [DESKTOP, PHONE, { width: 340, height: 700 }]) {
    test(`the itinerary preferences (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      let sent;
      // The AI never answers: only what was sent matters
      await page.route("**/api/itinerary", (route) => {
        sent = route.request().postDataJSON();
      });
      const trip = flightTrip({ id: "preferences-test", inDays: 10 });
      await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });

      const chip = (name) => page.getByRole("group", { name: "Intereses" }).getByRole("button", { name });
      await expect(chip("Cultura")).toHaveAttribute("aria-pressed", "true");
      await expect(chip("Playa")).toHaveAttribute("aria-pressed", "false");
      await chip("Playa").click();
      await chip("Cultura").click();
      await chip("Comida").click();
      await expect(chip("Playa")).toHaveAttribute("aria-pressed", "true");
      await expect(chip("Cultura")).toHaveAttribute("aria-pressed", "false");
      // The last one chosen stays
      await chip("Playa").click();
      await expect(chip("Playa")).toHaveAttribute("aria-pressed", "true");

      const pace = page.locator("#pace");
      if (viewport === DESKTOP) {
        await pace.click();
        await page.getByRole("menuitemradio", { name: "Intenso" }).click();
      } else await pace.selectOption("intense");
      await expect(page.getByText("Intenso").first()).toBeVisible();
      await expectNoSidewaysScroll(page);

      await page.getByRole("button", { name: /Crear itinerario/ }).click();
      await expect.poll(() => sent?.preferences).toMatchObject({ pace: "intense", interests: ["beach"] });
      // The trip goes with it, so its cost is kept per trip (the admin)
      expect(sent.tripId).toBe(trip.id);
    });
  }

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

  // A destination without a photo of its own: a generic travel photo (a wing, clouds), on its card and its header
  for (const viewport of [DESKTOP, PHONE]) {
    test(`a destination without a photo gets a generic travel one (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.route("**/api/photos?*", (route) => route.fulfill({ json: { CTA: null } }));
      const trip = flightTrip({ id: "no-photo", inDays: 10 });
      await openWith(page, "/es/trips", { trips: [trip] });
      const cardPhoto = page.locator("article img").first();
      await expect(cardPhoto).toHaveAttribute("src", /\/fallback\/travel-/);
      await expect.poll(() => cardPhoto.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
      await page.goto(`/es/trips?id=${trip.id}`);
      await expect(page.locator("img[src*='/fallback/travel-']").first()).toBeAttached();
      // Not a place, so nothing to credit
      await expect(page.locator("a[href*='commons.wikimedia']")).toHaveCount(0);
    });
  }

  // A photo lookup that failed (Wikidata busy) is not taken for "no photo": the next page asks again
  test("a destination photo that failed is asked for again @live", async ({ page }) => {
    let calls = 0;
    // The first answer leaves the airport out, as the server does when its lookup fails
    await page.route("**/api/photos?*", (route) => (calls++ === 0 ? route.fulfill({ json: {} }) : route.fallback()));
    const trip = flightTrip({ id: "photo-retry", inDays: 10 });
    await openWith(page, "/es/trips", { trips: [trip] });
    await expect.poll(() => calls).toBe(1);
    await page.locator("article").first().getByRole("link").first().click();
    await expect(page.locator("img[src*='wikimedia']").first()).toBeVisible({ timeout: 30_000 });
    expect(calls).toBeGreaterThan(1);
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
    await expect(page.getByRole("tabpanel").getByText("Excursión a Tivoli")).toHaveCount(0);
    await page.getByRole("tab", { name: /Día 2/ }).click();
    await expect(page.getByRole("tabpanel").getByText("Excursión a Tivoli · 50 min por trayecto")).toBeVisible();
    // Phones: scrolling down, the slim bar keeps saying it is the day trip
    await page.setViewportSize({ width: 390, height: 844 });
    await page.mouse.wheel(0, 1300);
    await expect(page.locator(".fixed.inset-x-0.top-0")).toContainText("Excursión a Tivoli");
    // A "Day trip" tag beside each stop of the trip, and only those
    await expect(page.locator('[role="tabpanel"] li').getByTitle("Parte de la excursión a Tivoli")).toHaveCount(2);
  });
});
