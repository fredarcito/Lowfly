import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, openWith, test } from "./helpers/test.js";
import { ROME_ITINERARY, flightTrip, manualTrip, romeTrip } from "./helpers/trips.js";

// Places the traveller wants in the itinerary for sure (docs/must-visit.md): picked from the map search (mocked
// here: OpenStreetMap's answers change), or told by hand when we do not find them

const SOTTO_VALLETTA = { id: "N1", name: "Sotto Pizzeria", street: "Triq Nofs-in-Nhar", town: "Valletta", kind: "amenity:restaurant", category: "food", lat: 35.89833, lng: 14.50882 };
const SOTTO_SLIEMA = { id: "N2", name: "Sotto Pinsa Romana Sliema", street: "Triq Mattew Pulis", town: "Tas-Sliema", kind: "amenity:restaurant", category: "food", lat: 35.90782, lng: 14.50812 };
const BIRGU = { id: "R1", name: "Il-Birgu", street: null, town: "Malta", kind: "place:town", category: "town", lat: 35.8875, lng: 14.5225 };
const SLIEMA = { id: "R2", name: "Tas-Sliema", street: null, town: "Malta", kind: "place:town", category: "town", lat: 35.912, lng: 14.502 };

// What the map search answers, by what was typed; `searches` keeps every request
const mockSpots = async (page, searches = []) => {
  await page.route("**/api/spots?**", (route) => {
    const params = new URL(route.request().url()).searchParams;
    searches.push(Object.fromEntries(params));
    const query = params.get("q").toLowerCase();
    const answers = {
      sotto: { spots: [SOTTO_VALLETTA, SOTTO_SLIEMA], tooFar: false },
      birgu: { spots: [BIRGU], tooFar: false },
      sliema: { spots: [SLIEMA], tooFar: false },
      "sagrada familia": { spots: [], tooFar: true },
    };
    route.fulfill({ json: answers[query] ?? { spots: [], tooFar: false } });
  });
};

const maltaTrip = (id) => flightTrip({ id, inDays: 10, city: "Malta", code: "MLA" });
const field = (page) => page.getByRole("combobox", { name: "Sitios que no te quieres perder" });
const addChip = (page) => page.getByRole("button", { name: "Añadir sitio" });
// The places chosen (not the chip that adds another)
const chips = (page) =>
  page
    .getByRole("list", { name: "Sitios que no te quieres perder" })
    .getByRole("listitem")
    .filter({ has: page.getByRole("button", { name: /^Quitar/ }) });
// The search opens from the "Add a place" chip, in its place
const search = async (page, text) => {
  await addChip(page).click();
  await field(page).fill(text);
};

test.describe("must-visit places", () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`picking places from the search, and the AI gets them (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const searches = [];
      await mockSpots(page, searches);
      let sent;
      // The AI never answers: only what was sent matters
      await page.route("**/api/itinerary", (route) => {
        sent = route.request().postDataJSON();
      });
      const trip = maltaTrip("must-visit-pick");
      await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });

      await expect(page.getByText("Opcional · hasta 5")).toBeVisible();
      // A chip, not a search box, until it is wanted
      await expect(field(page)).toHaveCount(0);
      await addChip(page).click();
      await expect(field(page)).toBeFocused();
      await expect(field(page)).toHaveAttribute("placeholder", "Busca en Malta…");
      // Left empty, it goes back to the chip
      await field(page).press("Escape");
      await expect(field(page)).toHaveCount(0);
      await search(page, "sotto");
      // Each match with its street and town, so the branches can be told apart
      const options = page.getByRole("listbox").getByRole("option");
      await expect(options.nth(0)).toContainText("Sotto Pizzeria");
      await expect(options.nth(0)).toContainText("Triq Nofs-in-Nhar · Valletta");
      await expect(options.nth(1)).toContainText("Tas-Sliema");
      await expect(page.getByRole("listbox").getByRole("option", { name: "No está en la lista" })).toBeVisible();
      // Searched around the arrival airport, with the trip's town
      expect(searches.at(-1)).toMatchObject({ q: "sotto", code: "MLA", town: "Malta" });
      await expectNoSidewaysScroll(page);

      await options.nth(0).click();
      await expect(chips(page)).toHaveCount(1);
      await expect(chips(page).first()).toContainText("Sotto Pizzeria");
      await expect(page.getByText("1 de 5 lugares")).toBeVisible();
      await expect(field(page)).toHaveCount(0);

      // With the keyboard
      await search(page, "birgu");
      await expect(page.getByRole("listbox").getByRole("option", { name: /Il-Birgu/ })).toBeVisible();
      await field(page).press("Enter");
      await expect(chips(page)).toHaveCount(2);

      // Removed, and added again
      await page.getByRole("button", { name: "Quitar Il-Birgu" }).click();
      await expect(chips(page)).toHaveCount(1);
      await search(page, "birgu");
      await page.getByRole("listbox").getByRole("option", { name: /Il-Birgu/ }).click();
      await expect(chips(page)).toHaveCount(2);

      // Kept with the trip: still there after reloading
      await page.reload();
      await expect(chips(page)).toHaveCount(2);

      await page.getByRole("button", { name: /Crear itinerario/ }).click();
      await expect.poll(() => sent?.preferences?.mustVisit).toMatchObject([
        { name: "Sotto Pizzeria", category: "food", lat: SOTTO_VALLETTA.lat, lng: SOTTO_VALLETTA.lng },
        { name: "Il-Birgu", category: "town" },
      ]);
    });
  }

  test("a place we did not find: its kind (required) and its area", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await mockSpots(page);
    let sent;
    await page.route("**/api/itinerary", (route) => {
      sent = route.request().postDataJSON();
    });
    const trip = maltaTrip("must-visit-not-found");
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });

    await search(page, "Bar de Pepe");
    await expect(page.getByText("No encontramos «Bar de Pepe» por aquí.")).toBeVisible();
    await page.getByRole("listbox").getByRole("option", { name: "No está en la lista" }).click();
    await expect(page.getByText("No encontramos «Bar de Pepe». Cuéntanos qué tipo de lugar es")).toBeVisible();

    // The kind first: without it, nothing to add, and a hint says so
    const add = page.getByRole("button", { name: "Añadir", exact: true });
    await expect(add).toBeDisabled();
    await expect(page.getByText("Elige una categoría para continuar.")).toBeVisible();
    await page.getByRole("radio", { name: "Para comer o beber" }).click();
    await expect(page.getByText("Elige una categoría para continuar.")).toHaveCount(0);
    await expect(page.getByRole("radio", { name: "Para comer o beber" })).toHaveAttribute("aria-checked", "true");

    // The area, from the towns and neighbourhoods only
    await page.getByRole("combobox", { name: /¿En qué zona está?/ }).fill("sliema");
    await page.getByRole("listbox").getByRole("option", { name: /Tas-Sliema/ }).click();
    await add.click();

    await expect(chips(page)).toHaveCount(1);
    await expect(chips(page).first()).toContainText("Bar de Pepe");
    await page.getByRole("button", { name: /Crear itinerario/ }).click();
    await expect.poll(() => sent?.preferences?.mustVisit).toMatchObject([
      { name: "Bar de Pepe", category: "food", lat: null, lng: null, area: "Tas-Sliema", areaLat: SLIEMA.lat, areaLng: SLIEMA.lng },
    ]);
  });

  test("a place too far is not offered; cancelling leaves nothing", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await mockSpots(page);
    const trip = maltaTrip("must-visit-far");
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });

    await search(page, "Sagrada Familia");
    await expect(page.getByText("«Sagrada Familia» queda demasiado lejos para ir y volver en el día.")).toBeVisible();
    await page.getByRole("listbox").getByRole("option", { name: "No está en la lista" }).click();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(chips(page)).toHaveCount(0);
    await expect(addChip(page)).toBeVisible();
  });

  test("five at most, and a note when the plan gets tight", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const places = ["Uno", "Dos", "Tres", "Cuatro"].map((name, index) => ({ id: `N${index}`, name, category: "sight", lat: 35.9, lng: 14.5 }));
    const trip = { ...maltaTrip("must-visit-full"), preferences: { mustVisit: places } };
    await mockSpots(page);
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });

    // 3 nights, 4 days: up to 6 is comfortable
    await expect(page.getByText("el plan irá muy justo")).toHaveCount(0);
    await search(page, "birgu");
    await page.getByRole("listbox").getByRole("option", { name: /Il-Birgu/ }).click();
    await expect(page.getByText("5 de 5 lugares")).toBeVisible();
    // Full: nothing more to add
    await expect(addChip(page)).toHaveCount(0);
  });

  // In the itinerary: each place asked for says so; one the AI could not fit is named, with a way to try again
  test("the itinerary marks the places asked for, and names any left out", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const itinerary = structuredClone(ROME_ITINERARY);
    const sights = itinerary.days[0].stops.filter((stop) => stop.place && stop.type === "imprescindible");
    sights[0].requested = 0;
    itinerary.missing = ["Bar de Pepe"];
    itinerary.preferences = { ...itinerary.preferences, mustVisit: [{ name: sights[0].place.name, category: "sight" }, { name: "Bar de Pepe", category: "food" }] };
    let sent;
    await page.route("**/api/itinerary", (route) => {
      sent = route.request().postDataJSON();
    });
    const trip = romeTrip({ itinerary });
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });

    const marked = page.locator("li").filter({ hasText: "Lo pediste tú" });
    await expect(marked).toHaveCount(1);
    await expect(marked).toContainText(sights[0].title);
    await expect(page.getByText("No pudimos encajar Bar de Pepe en tu plan.")).toBeVisible();
    await page.getByRole("button", { name: "Rehacer itinerario" }).click();
    // Made again with the same places
    await expect.poll(() => sent?.preferences?.mustVisit?.map((place) => place.name)).toEqual([sights[0].place.name, "Bar de Pepe"]);
  });

  // A trip planned by hand, made (or made again) from its page: each town's places under its name, kept on that
  // town and searched around it
  test("a trip planned by hand: each town's places in the itinerary card", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const searches = [];
    await mockSpots(page, searches);
    let sent;
    await page.route("**/api/itinerary", (route) => {
      sent = route.request().postDataJSON();
    });
    const trip = manualTrip({ id: "must-visit-manual" });
    trip.stops[0].mustVisit = [{ id: "W1", name: "Ponte Vecchio", category: "sight", lat: 43.768, lng: 11.2531 }];
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });

    await expect(page.getByText("Opcional · hasta 5 por ciudad")).toBeVisible();
    const town = (name) => page.getByRole("list", { name: `Sitios que no te quieres perder en ${name}` });
    // The one chosen in the planner, under its town
    await expect(town("Florencia").getByRole("button", { name: "Quitar Ponte Vecchio" })).toBeVisible();

    await town("Venecia").getByRole("button", { name: "Añadir sitio" }).click();
    await page.getByRole("combobox", { name: "Sitios que no te quieres perder en Venecia" }).fill("sotto");
    await page.getByRole("listbox").getByRole("option").first().click();
    expect(searches.at(-1)).toMatchObject({ q: "sotto", town: "Venecia", lat: "45.43713", lng: "12.33265" });
    await expect(town("Venecia").getByRole("button", { name: "Quitar Sotto Pizzeria" })).toBeVisible();

    await page.getByRole("button", { name: /Crear itinerario/ }).click();
    await expect.poll(() => sent?.stops?.map((stop) => stop.mustVisit.map((place) => place.name))).toEqual([["Ponte Vecchio"], ["Sotto Pizzeria"]]);
  });

  test("a short stay with many places gets the note", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const places = ["Uno", "Dos", "Tres"].map((name, index) => ({ id: `N${index}`, name, category: "sight", lat: 35.9, lng: 14.5 }));
    const trip = maltaTrip("must-visit-tight");
    trip.fare = { ...trip.fare, ret: null, nights: 0 };
    trip.preferences = { mustVisit: places };
    await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
    await expect(page.getByText("En 1 día, con tantos sitios el plan irá muy justo.")).toBeVisible();
  });
});
