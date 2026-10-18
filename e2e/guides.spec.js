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
      for (const title of ["Sobre Roma", "Dónde alojarte", "Cómo moverte", "Cuándo ir"]) await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
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
    expect(Date.parse(trip.dateModified)).not.toBeNaN();
  });

  // What people ask about the city, answered with the guide: in view, and the same ones for search engines
  // (FAQPage); and when it was written
  test("its frequently asked questions, and when it was written", async ({ page }) => {
    await page.goto("/es/guias/roma-3-dias");
    const faq = page.getByRole("region", { name: "Preguntas frecuentes sobre Roma" });
    for (const question of ["¿Cuántos días hacen falta para ver Roma?", "¿Dónde alojarse en Roma?", "¿Qué es imprescindible ver en Roma?"])
      await expect(faq.getByRole("heading", { level: 3, name: question })).toBeVisible();
    await expect(faq).toContainText("Día 1: Corazón de la Antigua Roma.");
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((block) => JSON.parse(block));
    const faqPage = blocks.find((block) => block["@type"] === "FAQPage");
    expect(faqPage.mainEntity.map((entry) => entry.name)).toEqual(await faq.getByRole("heading", { level: 3 }).allTextContents());
    // Each sight: how long it takes and what to look for there
    await expect(page.getByText(/\d+ (h|min).* de visita/).first()).toBeVisible();
    await expect(page.getByText("En qué fijarte:").first()).toBeVisible();
    await expect(page.getByText(/^Actualizada en \S+ de \d{4}$/)).toBeVisible();
  });

  test("the planner it opens starts in Rome", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/guias/roma-3-dias");
    await page.getByRole("link", { name: "Crear mi itinerario" }).click();
    await expect(page).toHaveURL(/\/es\/trips\/new\?to=FCO$/);
    await expect(page.locator("form section ol > li").first()).toContainText("Roma");
  });

  // With many guides, a country picked as in the flight search (searchable, with the keyboard) and the length in
  // sight; the cards follow
  test("filtering the guides by country and length", async ({ page }) => {
    await page.goto("/es/guias");
    const cards = page.getByRole("article");
    const all = await cards.count();
    await page.getByRole("button", { name: "Todos los países" }).click();
    await page.getByRole("combobox", { name: "Busca un país" }).fill("ita");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Italia" })).toBeVisible();
    const italian = await cards.count();
    expect(italian).toBeLessThan(all);
    await expect(cards.filter({ hasText: "Italia" })).toHaveCount(italian);
    await page.getByRole("radio", { name: "1 día" }).click();
    const oneDay = await cards.count();
    expect(oneDay).toBeGreaterThan(0);
    expect(oneDay).toBeLessThan(italian);
    await expect(cards.filter({ hasText: "1 día ·" })).toHaveCount(oneDay);
    await page.getByRole("radio", { name: "Todas" }).click();
    await expect(cards).toHaveCount(italian);
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
    // For any other trip, the planner
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

  // With enough guides, the list has a search and filters by country and length
  test("searching and filtering the guides", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/guias");
    const cards = page.getByRole("article");
    await page.getByRole("searchbox").fill("paris");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("París");
    await page.getByRole("searchbox").fill("");
    await page.getByRole("button", { name: "Todos los países" }).click();
    await page.getByRole("option", { name: "Francia" }).click();
    await page.getByRole("radio", { name: "3 días" }).click();
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("París");
    await page.getByRole("searchbox").fill("no existe");
    await expect(cards).toHaveCount(0);
    await expect(page.getByText("No hay guías con esa búsqueda.", { exact: false })).toBeVisible();
  });

  // A one-day guide says "1 día", "1 day", never "1 días"
  test("a one-day guide, in the singular", async ({ page }) => {
    await page.goto("/es/guias/bolonia-1-dia");
    await expect(page).toHaveTitle("Qué ver en Bolonia en 1 día: itinerario día a día · Lowfly");
    await expect(page.getByRole("heading", { level: 1, name: "Qué ver en Bolonia en 1 día" })).toBeVisible();
    await expect(page.getByText("Itinerario de 1 día · día a día")).toBeVisible();
    await expect(page.getByText("¿Tienes más de un día?")).toBeVisible();
    await page.goto("/en/guides/bologna-1-day");
    await expect(page).toHaveTitle("Bologna in 1 day: a day-by-day itinerary · Lowfly");
    await expect(page.getByRole("heading", { level: 1, name: "Bologna in 1 day: what to see" })).toBeVisible();
    await expect(page.getByText("More than one day?")).toBeVisible();
  });
});
