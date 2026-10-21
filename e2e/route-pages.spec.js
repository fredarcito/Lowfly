import { DESKTOP, NOT_FOUND_ERRORS, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";

// A multi-city route's own page (/es/recorridos/italia-clasica, /en/multi-city/classic-italy; docs/multi-city.md,
// route pages): what the route is like, town by town (src/data/multiCityPages/<route>.json), in the guides' look; no prices,
// and every way out to the "Recorridos" search as usual. The city guides of its towns link to it.
test.describe("multi-city route pages", () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`Italia clásica (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/es/recorridos/italia-clasica");
      await expect(page).toHaveTitle("Ruta por Italia en tren: Venecia, Florencia y Roma, de 5 a 13 días · Lowfly");
      await expect(page.getByRole("heading", { level: 1, name: "Ruta por Italia: Venecia, Florencia y Roma" })).toBeVisible();
      await expect(page.getByText("Recorrido · de 5 a 13 días")).toBeVisible();
      // Its lengths: the full one first (our pick), the long one adding Siena and Naples
      const versions = page.getByRole("radiogroup", { name: "Duración del recorrido" });
      await expect(versions.getByRole("radio", { name: "Completo" })).toHaveAttribute("aria-checked", "true");
      await expect(page.getByText("8–10 días · El que recomendamos")).toBeVisible();
      await versions.getByRole("radio", { name: "Largo" }).click();
      await expect(page.getByText("11–13 días")).toBeVisible();
      // Every town, with its nights in the recommended version (or the versions it is in), and its guide
      const towns = page.getByRole("region", { name: "Las ciudades" }).getByRole("heading", { level: 3 });
      await expect(towns).toHaveText(["Venecia", "Bolonia", "Florencia", "Siena", "Roma", "Nápoles"]);
      const venice = page.getByRole("region", { name: "Venecia" });
      await expect(venice.getByText("2 noches", { exact: true })).toBeVisible();
      await expect(venice.getByRole("link", { name: "Guía: qué ver en Venecia en 2 días" })).toHaveAttribute("href", "/es/guias/venecia-2-dias");
      await expect(page.getByRole("region", { name: "Siena" }).getByText("1 noche · solo en el largo")).toBeVisible();
      await expect(page.getByRole("region", { name: "Bolonia" }).getByText("1 noche · desde el completo")).toBeVisible();
      // No prices; both coloured buttons go to the search
      await expect(page.getByText(/\d+\s?€/)).toHaveCount(0);
      const searches = page.getByRole("link", { name: /Ver vuelos para recorridos así|Descubre más recorridos como este/ });
      await expect(searches).toHaveCount(2);
      for (const href of await searches.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) expect(href).toBe("/es/recorridos");
      await expectNoSidewaysScroll(page);
    });
  }

  // From a guide of one of its towns to the route, and on to the search
  test("guide → route → search", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/guias/venecia-2-dias");
    await page.getByRole("link", { name: /Venecia forma parte del recorrido Italia clásica/ }).click();
    await expect(page).toHaveURL(/\/es\/recorridos\/italia-clasica$/);
    await page.getByRole("link", { name: "Descubre más recorridos como este al mejor precio" }).click();
    await expect(page).toHaveURL(/\/es\/recorridos$/);
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("its English page, and what search engines read", async ({ page }) => {
    await page.goto("/en/multi-city/classic-italy");
    await expect(page.getByRole("heading", { level: 1, name: "Italy itinerary: Venice, Florence and Rome" })).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Italy by train: Venice, Florence and Rome in 5 to 13 days · Lowfly");
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute("href", /\/es\/recorridos\/italia-clasica$/);
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((block) => JSON.parse(block));
    const trip = blocks.find((block) => block["@type"] === "TouristTrip");
    expect(trip.itinerary.itemListElement.map((entry) => entry.item.name)).toEqual(["Venice", "Bologna", "Florence", "Siena", "Rome", "Naples"]);
    expect(blocks.find((block) => block["@type"] === "FAQPage").mainEntity.length).toBeGreaterThan(2);
    expect(blocks.find((block) => block["@type"] === "BreadcrumbList").itemListElement[1].item).toMatch(/\/en\/multi-city$/);
  });

  test("its name in the other language goes to this one's, and the sitemap lists it", async ({ page, request }) => {
    await page.goto("/es/recorridos/classic-italy");
    await expect(page).toHaveURL(/\/es\/recorridos\/italia-clasica$/);
    await page.goto("/es/multi-city/italia-clasica");
    await expect(page).toHaveURL(/\/es\/recorridos\/italia-clasica$/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://lowfly.travel/es/recorridos/italia-clasica</loc>");
    expect(sitemap).toContain("<loc>https://lowfly.travel/en/multi-city/classic-italy</loc>");
  });

  test.describe("a route with no page", () => {
    test.use({ expectedErrors: NOT_FOUND_ERRORS });
    test("is not found", async ({ page }) => {
      const response = await page.goto("/es/recorridos/no-existe");
      expect(response.status()).toBe(404);
    });
  });
});
