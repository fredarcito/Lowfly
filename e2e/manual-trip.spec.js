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
    await page.getByRole("button", { name: /next|siguiente/i }).first().click();
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

  test("checks the form, then saves the trip and opens it", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await openWith(page, "/es/trips");
    await page.getByRole("link", { name: "Planear un viaje" }).first().click();
    await page.waitForURL("**/trips/new");
    await page.getByRole("button", { name: "Crear viaje" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    await pickTown(page, 1, "flor", "Florencia");
    await pickDates(page, 1, 13, 15);
    await pickTime(page, 1, "arrive", "10:00");
    await pickTime(page, 1, "leave", "09:00");
    await page.getByRole("button", { name: "Añadir otra ciudad" }).click();
    await pickTown(page, 2, "venecia", "Venecia");
    await pickDates(page, 2, 15, 17);
    // Arriving in Venice before leaving Florence: not possible
    await pickTime(page, 2, "arrive", "08:00");
    await page.getByRole("button", { name: "Crear viaje" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    await pickTime(page, 2, "arrive", "11:30");
    await page.getByRole("button", { name: "Crear viaje" }).click();
    await page.waitForURL(/trips\?id=manual-/);
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
