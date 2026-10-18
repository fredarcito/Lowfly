import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";

// The city guides (/es/guias/roma-3-dias, /en/guides/rome-3-days): the itinerary the AI wrote once (src/data/cityGuides.json), the same
// for everyone, day by day, and every way out going to the planner with the city chosen;
// linked from the footer, the guides' page, the sitemap and the routes to the city
test.describe("city guides", () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`Rome in 3 days (${viewport.width}px)`, async ({ page }) => {
      const mapRequests = [];
      page.on("request", (request) => /arcgis|openstreetmap\.org/.test(request.url()) && mapRequests.push(request.url()));
      await page.setViewportSize(viewport);
      await page.goto("/es/guias/roma-3-dias");
      await expect(page).toHaveTitle("Qué ver en Roma en 3 días: itinerario día a día · Lowfly");
      await expect(page.getByRole("heading", { level: 1, name: "Qué ver en Roma en 3 días" })).toBeVisible();
      for (const title of ["Sobre Roma", "Dónde alojarte", "Cómo moverte", "Cuándo ir"]) await expect(page.getByRole("heading", { name: title })).toBeVisible();
      // Three days, each with its stops at the hour each starts (a rough one), and their links above, kept at the
      // top: no map (the map is the reader's own itinerary's)
      await expect(page.getByRole("heading", { level: 2, name: "Corazón de la Antigua Roma" })).toBeVisible();
      await expect(page.getByText("7 paradas · Horario orientativo").first()).toBeVisible();
      const days = page.getByRole("navigation", { name: "Días de la guía" }).getByRole("link");
      await expect(days).toHaveCount(3);
      await expect(days.first()).toHaveAttribute("aria-current", "location");
      await days.nth(2).click();
      await expect(page).toHaveURL(/#day-3$/);
      await expect(days.nth(2)).toHaveAttribute("aria-current", "location");
      await expect(page.locator(".leaflet-container, svg[aria-label^='Mapa']")).toHaveCount(0);
      expect(mapRequests).toEqual([]);
      // Every "make it yours" goes to the planner with Rome as its first town
      const ways = page.getByRole("link", { name: /Personalizar este viaje|mi llegada|mi ritmo|mis días|Crear mi itinerario/ });
      await expect(ways).toHaveCount(5);
      for (const href of await ways.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) expect(href).toBe("/es/trips/new?to=FCO");
      await expectNoSidewaysScroll(page);
    });
  }

  test("its own preview, and the trip day by day for search engines", async ({ page }) => {
    await page.goto("/en/guides/rome-3-days");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Rome in 3 days: a day-by-day itinerary · Lowfly");
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute("href", /\/es\/guias\/roma-3-dias$/);
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((block) => JSON.parse(block));
    const trip = blocks.find((block) => block["@type"] === "TouristTrip");
    expect(trip.itinerary.itemListElement).toHaveLength(3);
    expect(trip.itinerary.itemListElement[0].item.itemListElement.length).toBeGreaterThan(1);
  });

  test("the planner it opens starts in Rome", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/guias/roma-3-dias");
    await page.getByRole("link", { name: "Crear mi itinerario" }).click();
    await expect(page).toHaveURL(/\/es\/trips\/new\?to=FCO$/);
    await expect(page.locator("form section ol > li").first()).toContainText("Roma");
  });

  // The guides from anywhere: a tab of the top bar (marked on their pages), and the foot of every page, the home too
  test("the top bar and the home's foot lead to the guides", async ({ page }) => {
    await page.goto("/es");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Guías de viaje" })).toHaveAttribute("href", "/es/guias");
    const tab = page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Guías" });
    await expect(tab).not.toHaveAttribute("aria-current", "page");
    await tab.click();
    await expect(page).toHaveURL(/\/es\/guias$/);
    await expect(tab).toHaveAttribute("aria-current", "page");
    await page.goto("/es/guias/roma-3-dias");
    await expect(tab).toHaveAttribute("aria-current", "page");
  });

  test("the guides' page and the footer lead to it", async ({ page }) => {
    await page.goto("/es/privacy");
    await page.getByRole("contentinfo").getByRole("link", { name: "Guías de viaje" }).click();
    await expect(page).toHaveURL(/\/es\/guias$/);
    // With few guides, no search to get in the way; and for any other trip, the planner
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Crear itinerario", exact: true }).last()).toHaveAttribute("href", "/es/trips/new");
    await expect(page.getByRole("article").filter({ hasText: "Italia" }).filter({ hasText: "3 días · 12 lugares" })).toBeVisible();
    await page.getByRole("link", { name: /Qué ver en Roma en 3 días/ }).click();
    await expect(page).toHaveURL(/\/es\/guias\/roma-3-dias$/);
  });

  // "Share", as on a trip: the dialog with the guide's link to copy (or send, where there is a share sheet), with
  // no account; on its card without opening it, and on the guide's own page
  test("sharing a guide: its link to copy", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/guias");
    await page.getByRole("article").filter({ hasText: "Qué ver en Roma en 3 días" }).getByRole("button", { name: "Compartir" }).click();
    const dialog = page.getByRole("dialog", { name: "Compartir esta guía" });
    await expect(dialog.getByRole("textbox", { name: "Enlace para compartir" })).toHaveValue(/\/es\/guias\/roma-3-dias$/);
    await dialog.getByRole("button", { name: "Copiar" }).click();
    await expect(dialog.getByRole("button", { name: "Copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/es\/guias\/roma-3-dias$/);
    await expect(page).toHaveURL(/\/es\/guias$/);
    await page.goto("/es/guias/lisboa-3-dias");
    await page.getByRole("button", { name: "Compartir" }).click();
    await expect(page.getByRole("dialog", { name: "Compartir esta guía" }).getByRole("textbox")).toHaveValue(/\/es\/guias\/lisboa-3-dias$/);
  });

  test("a route to Rome links to its guide, and the sitemap lists it", async ({ page, request }) => {
    await page.goto("/es/flights/malta-rome");
    await expect(page.getByRole("link", { name: /Qué ver en Roma/ })).toHaveAttribute("href", "/es/guias/roma-3-dias");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://lowfly.travel/es/guias/roma-3-dias</loc>");
    expect(sitemap).toContain("<loc>https://lowfly.travel/en/guides</loc>");
  });

  // Each language names them its own way (constants/sections, scripts/city-guides.mjs): the language switch goes
  // to the same guide under its other name, and an address in the wrong language (an old link, one written by hand)
  // is sent to the right one
  test("named in each language", async ({ page, request }) => {
    await page.goto("/es/guias/roma-3-dias");
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en\/guides\/rome-3-days$/);
    await page.getByRole("navigation", { name: "Idioma" }).getByRole("link", { name: "en" }).click();
    await expect(page).toHaveURL(/\/en\/guides\/rome-3-days$/);
    await expect(page.getByRole("heading", { level: 1, name: "Rome in 3 days: what to see" })).toBeVisible();
    await page.goto("/en/guides");
    await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "es" }).click();
    await expect(page).toHaveURL(/\/es\/guias$/);
    for (const [from, to] of [
      ["/es/guides", /\/es\/guias$/],
      ["/es/guides/roma-3-dias", /\/es\/guias\/roma-3-dias$/],
      ["/es/guias/rome-3-days", /\/es\/guias\/roma-3-dias$/],
      ["/en/guias/lisboa-3-dias", /\/en\/guides\/lisbon-3-days$/],
    ]) {
      await page.goto(from);
      await expect(page).toHaveURL(to);
    }
    expect((await request.get("/es/guias/no-existe")).status()).toBe(404);
  });
});
