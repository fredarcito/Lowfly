import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DESKTOP, expect, openWith, test } from "./helpers/test.js";

// easyJet and Vueling in the route graph (constants/airlines GRAPH_MORE_AIRLINES): the airports only they fly to
// (src/data/extraAirports.json, scripts/extra-airports.mjs) are known as destinations, never offered as departures,
// as no live search runs from them; their prices (Travelpayouts, not live) say so
const EXTRA = JSON.parse(readFileSync(join(process.cwd(), "src/data/extraAirports.json"), "utf8"));

test.describe("easyJet and Vueling", () => {
  test("their airports, each with names in both languages, its country, place and time zone", () => {
    expect(Object.keys(EXTRA).length).toBeGreaterThan(100);
    for (const [code, airport] of Object.entries(EXTRA)) {
      expect(code).toMatch(/^[A-Z]{3}$/);
      expect(airport).toMatchObject({
        name: { es: expect.any(String), en: expect.any(String) },
        city: { es: expect.any(String), en: expect.any(String) },
        countryCode: expect.stringMatching(/^[A-Z]{2}$/),
        lat: expect.any(Number),
        lon: expect.any(Number),
        tz: expect.stringMatching(/\//),
      });
      expect(airport.airlines.length, code).toBeGreaterThan(0);
    }
    expect(EXTRA.GVA.city).toEqual({ es: "Ginebra", en: "Geneva" });
  });

  test("Geneva is a known destination, not a departure airport", async ({ page, request }) => {
    const { airports } = await (await request.get("/api/airports?lang=es")).json();
    expect(airports.find((airport) => airport.code === "GVA")).toMatchObject({ city: "Ginebra", country: "Suiza", destinationOnly: true });
    // Ryanair's and Wizz Air's own airports stay departures
    expect(airports.find((airport) => airport.code === "MLA").destinationOnly).toBeUndefined();

    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es", { origin: "MLA" });
    await page.locator("#origin").click();
    await page.getByRole("combobox").fill("Ginebra");
    await expect(page.getByRole("option", { name: /Ginebra/ })).toHaveCount(0);
    await page.getByRole("combobox").fill("Basilea");
    await expect(page.getByRole("option", { name: /Basilea/ }).first()).toBeVisible();
  });
});
