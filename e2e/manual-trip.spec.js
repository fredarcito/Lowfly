import { DESKTOP, PHONE, TABLET, expect, expectNoSidewaysScroll, openWith, savedTrips, test } from "./helpers/test.js";
import { serveRecordedPlaces } from "./helpers/places.js";
import { FLORENCE_VENICE_ITINERARY, dayFromNow, manualTrip } from "./helpers/trips.js";

// A trip planned by hand (no flights): its form, what it checks, and the trip once made
test.describe("trip planned by hand", () => {
  // Town searches answered from a recording (the real search is tested on its own, @live)
  test.beforeEach(async ({ page }, testInfo) => {
    if (!testInfo.title.includes("@live")) await serveRecordedPlaces(page);
  });

  const stopItem = (page, number) => page.locator("form section ol > li").nth(number - 1);

  const pickTown = async (page, number, search, name) => {
    await stopItem(page, number).locator("input[role=combobox]").fill(search);
    await page.getByRole("option", { name: new RegExp(name) }).first().click();
  };

  // Days of next month: always ahead of today
  const pickDates = async (page, number, firstDay, lastDay) => {
    await stopItem(page, number).locator("[id$=-dates]").click();
    // The first town: next month (the calendar opens on this one). A later one opens on its own month already.
    if (number === 1) await page.getByRole("button", { name: /mes siguiente|next month/i }).first().click();
    const day = (dayNumber) => page.locator("[role=gridcell] button, button[data-day]").filter({ hasText: new RegExp(`^${dayNumber}$`) }).first();
    await day(firstDay).click();
    await day(lastDay).click();
  };

  // The times are folded away: unfold them first
  const pickTime = async (page, number, which, time) => {
    const times = stopItem(page, number).getByRole("button", { name: /Añadir horarios/ });
    if ((await times.getAttribute("aria-expanded")) === "false") await times.click();
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
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    // Arriving in Venice before leaving Florence: not possible
    await fillRoute(page, "08:00");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(styleStep(page)).toHaveCount(0);

    await pickTime(page, 2, "arrive", "11:30");
    await page.getByRole("button", { name: "Continuar" }).click();
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
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(styleStep(page)).toBeVisible();

    await page.getByRole("button", { name: "Atrás" }).click();
    // The towns are still there
    await expect(stopItem(page, 2)).toContainText("Venecia");
    await pickTime(page, 2, "arrive", "12:00");
    await page.getByRole("button", { name: "Continuar" }).click();
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
    await page.getByRole("button", { name: "Continuar" }).click();
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

  test("removing a town folds it away, and the summary follows", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es/trips/new");
    await fillRoute(page);
    const summary = page.locator("aside");
    await expect(summary).toContainText("Florencia → Venecia");
    await expect(summary).toContainText("2 ciudades");
    await stopItem(page, 2).getByRole("button", { name: "Quitar ciudad" }).click();
    await expect(page.locator("form section ol > li")).toHaveCount(1);
    await expect(summary).toContainText("1 ciudad");
    await expect(summary).not.toContainText("Venecia");
    // The only town cannot be removed
    await expect(stopItem(page, 1).getByRole("button", { name: "Quitar ciudad" })).toHaveCount(0);
  });

  test("phones: the dates fit and Continue stays at hand at the bottom", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openWith(page, "/es/trips/new");
    await pickTown(page, 1, "flor", "Florencia");
    await pickDates(page, 1, 13, 15);
    await expectNoSidewaysScroll(page);
    const card = await stopItem(page, 1).boundingBox();
    const dates = await stopItem(page, 1).locator("[id$=-dates]").boundingBox();
    expect(dates.x + dates.width).toBeLessThanOrEqual(card.x + card.width);
    await expect(page.getByRole("button", { name: "Continuar" })).toBeInViewport();
  });

  test("Departure opens on its own end: the arrival stays and earlier days cannot be picked", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es/trips/new");
    await pickDates(page, 1, 13, 16);
    const arrival = stopItem(page, 1).locator("[id$=-dates]");
    const departure = stopItem(page, 1).locator("[id$=-dates-end]");
    const arrivalText = await arrival.innerText();
    await departure.click();
    const day = (dayNumber) => page.locator("[role=gridcell] button, button[data-day]").filter({ hasText: new RegExp(`^${dayNumber}$`) }).first();
    await expect(day(12)).toBeDisabled();
    await day(18).click();
    await expect(arrival).toHaveText(arrivalText);
    await expect(departure).toContainText("18");
    await expect(stopItem(page, 1)).toContainText("6 días · 5 noches");
  });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`a town just added comes into view, ready to type (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWith(page, "/es/trips/new");
      await pickTown(page, 1, "flor", "Florencia");
      await pickDates(page, 1, 13, 15);
      await page.getByRole("button", { name: "Añadir otra ciudad" }).click();
      const search = stopItem(page, 2).locator("input[role=combobox]");
      await expect(search).toBeFocused();
      await expect(search).toBeInViewport();
      await page.keyboard.type("venecia");
      await expect(page.getByRole("option").first()).toBeVisible();
    });
  }

  test("the town search finds real towns @live", async ({ page }) => {
    await openWith(page, "/es/trips/new");
    await stopItem(page, 1).locator("input[role=combobox]").fill("flor");
    await expect(page.getByRole("option", { name: /Florencia/ }).first()).toBeVisible({ timeout: 30_000 });
  });

  // Back to the route sits beside "Create itinerary": in the summary on desktop, in the fixed bar on phones
  for (const viewport of [DESKTOP, PHONE]) {
    test(`step 2's Back is beside Create and returns to the route (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWith(page, "/es/trips/new");
      await fillRoute(page);
      await page.getByRole("button", { name: "Continuar" }).click();
      const back = page.getByRole("button", { name: "Atrás" });
      const create = page.getByRole("button", { name: "Crear itinerario" });
      await expect(back).toBeInViewport();
      const [backBox, createBox] = [await back.boundingBox(), await create.boundingBox()];
      expect(Math.abs(backBox.y - createBox.y)).toBeLessThan(4);
      await back.click();
      await expect(stopItem(page, 2)).toContainText("Venecia");
    });
  }

  test("phones: going between steps, the actions bar stays put (only the form slides)", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openWith(page, "/es/trips/new");
    await pickTown(page, 1, "flor", "Florencia");
    await pickDates(page, 1, 13, 15);
    const barTop = () => page.evaluate(() => Math.round(document.querySelector(".fixed.inset-x-0.bottom-0").getBoundingClientRect().top));
    const topsWhileChanging = async () => {
      const tops = [];
      for (let sample = 0; sample < 6; sample++) {
        tops.push(await barTop());
        await page.waitForTimeout(40);
      }
      return new Set(tops).size;
    };
    // Same height in both steps: the buttons never move
    const before = await barTop();
    await page.getByRole("button", { name: "Continuar" }).click();
    expect(await topsWhileChanging()).toBe(1);
    expect(await barTop()).toBe(before);
    await page.getByRole("button", { name: "Atrás" }).click();
    expect(await topsWhileChanging()).toBe(1);
    expect(await barTop()).toBe(before);
  });
});
