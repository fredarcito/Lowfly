import { DESKTOP, PHONE, TABLET, expect, expectNoSidewaysScroll, openWith, savedTrips, test } from "./helpers/test.js";
import { FLORENCE_VENICE_ITINERARY, dayFromNow, manualTrip } from "./helpers/trips.js";

// A trip planned by hand (no flights): its form, what it checks, and the trip once made
test.describe("trip planned by hand", () => {
  const stopItem = (page, number) => page.locator("form ol > li").nth(number - 1);

  const pickTown = async (page, number, search, name) => {
    await stopItem(page, number).locator("input[role=combobox]").fill(search);
    await page.getByRole("option", { name: new RegExp(name) }).first().click();
  };

  // Next month's days: always ahead of today
  const pickDates = async (page, number, firstDay, lastDay) => {
    await stopItem(page, number).locator("[id$=-dates]").click();
    // The calendar's own arrow (the form has a "Siguiente" button too)
    await page.getByRole("button", { name: /mes siguiente|next month/i }).first().click();
    const day = (dayNumber) => page.locator("[role=gridcell] button, button[data-day]").filter({ hasText: new RegExp(`^${dayNumber}$`) }).first();
    await day(firstDay).click();
    await day(lastDay).click();
  };

  const pickTime = async (page, number, which, time) => {
    await stopItem(page, number).locator(`[id$=-${which}-time]`).click();
    await page.getByRole("menuitemradio", { name: time }).click();
  };

  for (const viewport of [DESKTOP, PHONE]) {
    test(`town, dates and times in the form (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWith(page, "/es/trips/new");
      await pickTown(page, 1, "rom", "Roma.*Lacio");
      await pickDates(page, 1, 20, 23);
      await pickTime(page, 1, "arrive", "10:30");
      await expect(stopItem(page, 1)).toContainText("10:30");
      // A second town on a single day: arriving and leaving the same day is fine
      await page.getByRole("button", { name: "Añadir otra ciudad" }).click();
      await pickDates(page, 2, 23, 23);
      await expect(stopItem(page, 2)).toContainText("23");
    });
  }

  // Florence (13 → 15 of next month), then Venice (15 → 17); Venice arrives after leaving Florence
  const fillRoute = async (page, veniceArrival = "11:30") => {
    await pickTown(page, 1, "flor", "Florencia");
    await pickDates(page, 1, 13, 15);
    await pickTime(page, 1, "arrive", "10:00");
    await pickTime(page, 1, "leave", "09:00");
    await page.getByRole("button", { name: "Añadir otra ciudad" }).click();
    await pickTown(page, 2, "venecia", "Venecia");
    await pickDates(page, 2, 15, 17);
    await pickTime(page, 2, "arrive", veniceArrival);
  };

  const styleStep = (page) => page.locator('[aria-current="step"]', { hasText: "Tu estilo" });

  test("step 1 checks the route, then saves the trip and goes on to its style", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await openWith(page, "/es/trips");
    await page.getByRole("link", { name: "Planear un viaje" }).first().click();
    await page.waitForURL("**/trips/new");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    // Arriving in Venice before leaving Florence: not possible
    await fillRoute(page, "08:00");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(styleStep(page)).toHaveCount(0);

    await pickTime(page, 2, "arrive", "11:30");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(styleStep(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Crear itinerario" })).toBeVisible();
    // Same page; the trip is already saved
    expect(page.url()).toMatch(/\/trips\/new$/);
    const [trip] = await savedTrips(page);
    expect(trip.manual).toBe(true);
    expect(trip.fare.city).toBe("Florencia → Venecia");
    expect(trip.fare.nights).toBe(4);
    expect(trip.stops.map((stop) => [stop.city, stop.arrive.time, stop.leave.time])).toEqual([
      ["Florencia", "10:00", "09:00"],
      // Leaving Venice without a time: it is optional
      ["Venecia", "11:30", null],
    ]);
  });

  test("back to the route and on again changes the same trip; or leave the itinerary for later", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await openWith(page, "/es/trips/new");
    await fillRoute(page);
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(styleStep(page)).toBeVisible();

    await page.getByRole("button", { name: "Atrás" }).click();
    // The towns are still there
    await expect(stopItem(page, 2)).toContainText("Venecia");
    await pickTime(page, 2, "arrive", "12:00");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(styleStep(page)).toBeVisible();
    const trips = await savedTrips(page);
    expect(trips).toHaveLength(1);
    expect(trips[0].stops[1].arrive.time).toBe("12:00");

    await page.getByRole("button", { name: "Prefiero crearlo después" }).click();
    await page.waitForURL(/trips\?id=manual-/);
    await expect(page.getByRole("button", { name: "Crear itinerario" })).toBeVisible();
  });

  test("the itinerary is created in step 2, then the trip opens with it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    // The AI answers with a real itinerary after a moment
    await page.route("**/api/itinerary", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({ json: FLORENCE_VENICE_ITINERARY });
    });
    await openWith(page, "/es/trips/new");
    await fillRoute(page);
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "Crear itinerario" }).click();
    await expect(page.locator("section[role=status]")).toBeVisible();
    await page.waitForURL(/trips\?id=manual-/);
    await expect(page.getByRole("tab", { name: /Día 1/ })).toBeVisible();
  });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`its itinerary, and a menu without flights to book (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const trip = manualTrip({ itinerary: FLORENCE_VENICE_ITINERARY });
      await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
      await page.getByRole("tab", { name: /Día 2/ }).click();
      await expect(page.getByRole("tab", { name: /Día 2/ })).toHaveAttribute("aria-selected", "true");
      await page.getByRole("button", { name: /Más opciones/ }).first().click();
      await expect(page.getByRole("menuitem")).toHaveText(["Rehacer itinerario", "Eliminar viaje"]);
    });
  }

  // Five towns, one with a long name: every card keeps to its column (the name is cut with "…")
  for (const viewport of [DESKTOP, TABLET, PHONE]) {
    test(`a route of five towns fits (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const towns = ["Madrid", "San Sebastián de los Reyes", "Zaragoza", "Barcelona", "Perpiñán"];
      const stops = towns.map((city, index) => ({
        city,
        country: "España",
        countryCode: "ES",
        lat: 40,
        lng: -3,
        code: null,
        arrive: { day: dayFromNow(30 + index * 2), time: "10:00" },
        leave: { day: dayFromNow(32 + index * 2), time: null },
      }));
      const trip = { ...manualTrip({ id: "five-towns" }), stops };
      await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
      const route = page.locator("section").filter({ hasText: "Tu ruta" }).first();
      await expect(route.locator("li")).toHaveCount(5);
      const routeBox = await route.boundingBox();
      for (const card of await route.locator("li").all()) {
        const cardBox = await card.boundingBox();
        expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(routeBox.x + routeBox.width);
      }
      await expect(route.getByText("2 noches").first()).toBeVisible();
      await expectNoSidewaysScroll(page);
    });
  }
});
