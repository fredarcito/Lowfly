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
    await page.getByRole("listbox").getByRole("option", { name: new RegExp(name) }).first().click();
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
    const field = stopItem(page, number).locator(`[id$=-${which}-time]`);
    // Phones: the system's own picker (a native select); desktop: a menu
    if ((await field.evaluate((element) => element.tagName)) === "SELECT") await field.selectOption(time);
    else {
      await field.click();
      await page.getByRole("menuitemradio", { name: time }).click();
    }
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

  // Places to visit for sure, in each town's card (docs/must-visit.md): they wait for the town, belong to it, show in
  // the summary, and go to the AI with their town
  test("each town's places to visit for sure", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const searches = [];
    await page.route("**/api/spots?**", (route) => {
      searches.push(Object.fromEntries(new URL(route.request().url()).searchParams));
      route.fulfill({ json: { spots: [{ id: "W1", name: "Galleria degli Uffizi", street: "Piazzale degli Uffizi", town: "Firenze", category: "museum", lat: 43.7678, lng: 11.2553 }], tooFar: false } });
    });
    let sent;
    await page.route("**/api/itinerary", (route) => {
      sent = route.request().postDataJSON();
    });
    await openWith(page, "/es/trips/new");

    const placesRow = (number) => stopItem(page, number).getByRole("button", { name: /Sitios que no te quieres perder/ });
    // Without a town, nowhere to search yet
    await expect(placesRow(1)).toBeDisabled();
    await expect(placesRow(1)).toContainText("Elige primero la ciudad");

    await fillRoute(page);
    await placesRow(1).click();
    await stopItem(page, 1).getByRole("button", { name: "Añadir sitio" }).click();
    await stopItem(page, 1).getByRole("combobox", { name: "Sitios que no te quieres perder" }).fill("uffizi");
    await page.getByRole("listbox").getByRole("option", { name: /Galleria degli Uffizi/ }).click();
    // Searched around that town
    expect(searches.at(-1)).toMatchObject({ q: "uffizi", town: "Florencia" });
    await expect(placesRow(1)).toContainText("1 sitio");
    await expect(page.getByText("1 sitio que quieres ver")).toBeVisible();

    // Another town: its places go with the old one
    await stopItem(page, 2).getByRole("button", { name: "Cambiar de ciudad" }).click();
    await pickTown(page, 2, "venecia", "Venecia");
    await expect(placesRow(2)).toContainText("Opcional");

    await page.getByRole("button", { name: "Continuar" }).click();
    const trips = await savedTrips(page);
    expect(trips[0].stops[0].mustVisit).toMatchObject([{ name: "Galleria degli Uffizi", category: "museum" }]);
    await page.getByRole("button", { name: "Crear itinerario" }).click();
    await expect.poll(() => sent?.stops?.map((stop) => stop.mustVisit.map((place) => place.name))).toEqual([["Galleria degli Uffizi"], []]);
  });

  test("changing a town removes its places, and says so", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.route("**/api/spots?**", (route) =>
      route.fulfill({ json: { spots: [{ id: "W1", name: "Ponte Vecchio", street: null, town: "Firenze", category: "sight", lat: 43.768, lng: 11.2531 }], tooFar: false } })
    );
    await openWith(page, "/es/trips/new");
    await pickTown(page, 1, "flor", "Florencia");
    await stopItem(page, 1).getByRole("button", { name: /Sitios que no te quieres perder/ }).click();
    await stopItem(page, 1).getByRole("button", { name: "Añadir sitio" }).click();
    await stopItem(page, 1).getByRole("combobox", { name: "Sitios que no te quieres perder" }).fill("ponte");
    await page.getByRole("listbox").getByRole("option", { name: /Ponte Vecchio/ }).click();

    await stopItem(page, 1).getByRole("button", { name: "Cambiar de ciudad" }).click();
    await expect(stopItem(page, 1).getByText("Quitamos los sitios de Florencia")).toBeVisible();
    await expect(stopItem(page, 1).getByRole("button", { name: "Quitar Ponte Vecchio" })).toHaveCount(0);
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
      await page.keyboard.press("Escape");
      // Each town's weather, by name, in the route's order
      const weather = page.getByRole("region", { name: "Qué tiempo esperar" });
      await expect(weather.getByText("Florencia 5 a 14 °C · Venecia 4 a 12 °C")).toBeVisible();
      await weather.getByRole("button", { name: "Qué llevar" }).click();
      await expect(weather.getByRole("listitem")).toHaveCount(2);
      await expect(weather.getByRole("listitem").first()).toContainText("Florencia");
      await expect(weather.getByRole("listitem").first()).toContainText("Fresco · 5 a 14 °C · Lluvias frecuentes");
      await expect(weather.getByRole("listitem").last()).toContainText("botas impermeables");
      await expectNoSidewaysScroll(page);
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
      await route.getByRole("button", { name: /Tu ruta/ }).click();
      await expect(route.locator("li")).toHaveCount(5);
      await expect(route.locator("li").last()).toBeVisible();
      const routeBox = await route.boundingBox();
      for (const card of await route.locator("li").all()) {
        const cardBox = await card.boundingBox();
        expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(routeBox.x + routeBox.width);
      }
      await expect(route.locator("li").getByText("2 noches").first()).toBeVisible();
      await expectNoSidewaysScroll(page);
    });
  }

  // The route starts folded (one line: each town and its nights) and opens into a card per town with its dates.
  // A town left the same day it is reached shows its hours, or "De paso" without times.
  test("the route folds to one line and opens into its towns", async ({ page }) => {
    const base = manualTrip({ id: "folded-route" });
    const day = base.stops[1].leave.day;
    const stops = [
      ...base.stops,
      { ...base.stops[1], city: "Padua", code: null, arrive: { day, time: "19:00" }, leave: { day, time: "23:30" } },
      { ...base.stops[1], city: "Verona", code: null, arrive: { day, time: null }, leave: { day, time: null } },
    ];
    const trip = { ...base, stops };
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
    const route = page.locator("section").filter({ hasText: "Tu ruta" }).first();
    const toggle = route.getByRole("button", { name: /Tu ruta/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(route).toContainText("Florencia");
    await expect(route).toContainText("Verona");
    await expect(route.locator("li").first()).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(route.locator("li")).toHaveCount(4);
    await expect(route.locator("li").first()).toBeVisible();
    await expect(route.locator("li").nth(0)).toContainText("1 noche");
    await expect(route.locator("li").nth(2)).toContainText("4 h 30 min");
    await expect(route.locator("li").nth(3)).toContainText("De paso");
    await toggle.click();
    await expect(route.locator("li").first()).toBeHidden();
  });

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
      await expect(page.getByRole("listbox").getByRole("option").first()).toBeVisible();
    });
  }

  test("the town search finds real towns @live", async ({ page }) => {
    await openWith(page, "/es/trips/new");
    await stopItem(page, 1).locator("input[role=combobox]").fill("flor");
    await expect(page.getByRole("listbox").getByRole("option", { name: /Florencia/ }).first()).toBeVisible({ timeout: 30_000 });
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
      // Measured once step 2 has finished sliding in
      const gap = async () => Math.abs((await back.boundingBox()).y - (await create.boundingBox()).y);
      await expect.poll(gap).toBeLessThan(4);
      await back.click();
      await expect(stopItem(page, 2)).toContainText("Venecia");
    });
  }

  // A real phone (it rescales a page that gets wider for a moment): the bar must not jump when the step changes
  test("phones: going between steps, the actions bar stays put (only the form slides)", async ({ browser }) => {
    const context = await browser.newContext({ viewport: PHONE, isMobile: true, hasTouch: true, locale: "es-ES" });
    const page = await context.newPage();
    await serveRecordedPlaces(page);
    await openWith(page, "/es/trips/new");
    await pickTown(page, 1, "flor", "Florencia");
    await pickDates(page, 1, 13, 15);
    // Every frame for a while: where the bar is, and how tall the screen is
    const framesWhile = async (action) => {
      const watching = page.evaluate(
        () =>
          new Promise((resolve) => {
            const seen = new Set();
            const started = performance.now();
            const frame = () => {
              const bar = document.querySelector(".fixed.inset-x-0.bottom-0");
              seen.add(`${window.innerHeight}:${Math.round(bar.getBoundingClientRect().top)}`);
              if (performance.now() - started < 700) requestAnimationFrame(frame);
              else resolve([...seen]);
            };
            requestAnimationFrame(frame);
          })
      );
      await action();
      return watching;
    };
    const forward = await framesWhile(() => page.getByRole("button", { name: "Continuar" }).tap());
    const back = await framesWhile(() => page.getByRole("button", { name: "Atrás" }).tap());
    expect(forward).toHaveLength(1);
    expect(back).toEqual(forward);
    await context.close();
  });
});
