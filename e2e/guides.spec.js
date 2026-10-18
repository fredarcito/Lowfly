import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";

// The city guides (/es/guides/rome-3-days): the itinerary the AI wrote once (src/data/cityGuides.json), the same
// for everyone, with a miniature map of each day and every way out going to the planner with the city chosen;
// linked from the footer, the guides' page, the sitemap and the routes to the city
test.describe("city guides", () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`Rome in 3 days (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/es/guides/rome-3-days");
      await expect(page).toHaveTitle("Qué ver en Roma en 3 días: itinerario día a día · Lowfly");
      await expect(page.getByRole("heading", { level: 1, name: "Qué ver en Roma en 3 días" })).toBeVisible();
      for (const title of ["Sobre Roma", "Dónde alojarte", "Cómo moverte", "Cuándo ir"]) await expect(page.getByRole("heading", { name: title })).toBeVisible();
      // Three days, each with its stops and a miniature of the city with the day's pins: fixed (nothing to drag or
      // zoom), and only loaded once scrolled to
      await expect(page.getByText(/^Día [1-3]$/)).toHaveCount(3);
      expect(await page.locator(".leaflet-container").count()).toBeLessThan(3);
      for (const number of [1, 2, 3]) {
        await page.getByText(`Día ${number}`, { exact: true }).scrollIntoViewIfNeeded();
        await expect(page.locator(".leaflet-container")).toHaveCount(number);
      }
      await expect(page.locator(".leaflet-marker-icon").first()).toBeAttached();
      await expect(page.locator(".leaflet-control-zoom")).toHaveCount(0);
      // Every "make it yours" goes to the planner with Rome as its first town
      const ways = page.getByRole("link", { name: /a mi medida|mi llegada|mi ritmo|mis días|Crear mi itinerario/ });
      await expect(ways).toHaveCount(5);
      for (const href of await ways.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) expect(href).toBe("/es/trips/new?to=FCO");
      await expectNoSidewaysScroll(page);
    });
  }

  test("its own preview, and the trip day by day for search engines", async ({ page }) => {
    await page.goto("/en/guides/rome-3-days");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Rome in 3 days: a day-by-day itinerary · Lowfly");
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute("href", /\/es\/guides\/rome-3-days$/);
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((block) => JSON.parse(block));
    const trip = blocks.find((block) => block["@type"] === "TouristTrip");
    expect(trip.itinerary.itemListElement).toHaveLength(3);
    expect(trip.itinerary.itemListElement[0].item.itemListElement.length).toBeGreaterThan(1);
  });

  test("the planner it opens starts in Rome", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/guides/rome-3-days");
    await page.getByRole("link", { name: "Crear mi itinerario" }).click();
    await expect(page).toHaveURL(/\/es\/trips\/new\?to=FCO$/);
    await expect(page.locator("form section ol > li").first()).toContainText("Roma");
  });

  test("the guides' page and the footer lead to it", async ({ page }) => {
    await page.goto("/es/privacy");
    await page.getByRole("contentinfo").getByRole("link", { name: "Guías de viaje" }).click();
    await expect(page).toHaveURL(/\/es\/guides$/);
    // With few guides, no search to get in the way; and for any other trip, the planner
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Crear itinerario", exact: true }).last()).toHaveAttribute("href", "/es/trips/new");
    await expect(page.getByRole("article").filter({ hasText: "Italia · 3 días" })).toBeVisible();
    await page.getByRole("link", { name: /Qué ver en Roma en 3 días/ }).click();
    await expect(page).toHaveURL(/\/es\/guides\/rome-3-days$/);
  });

  // "Share", as on a trip: the dialog with the guide's link to copy (or send, where there is a share sheet), with
  // no account; on its card without opening it, and on the guide's own page
  test("sharing a guide: its link to copy", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/guides");
    await page.getByRole("article").filter({ hasText: "Qué ver en Roma en 3 días" }).getByRole("button", { name: "Compartir" }).click();
    const dialog = page.getByRole("dialog", { name: "Compartir esta guía" });
    await expect(dialog.getByRole("textbox", { name: "Enlace para compartir" })).toHaveValue(/\/es\/guides\/rome-3-days$/);
    await dialog.getByRole("button", { name: "Copiar" }).click();
    await expect(dialog.getByRole("button", { name: "Copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/es\/guides\/rome-3-days$/);
    await expect(page).toHaveURL(/\/es\/guides$/);
    await page.goto("/es/guides/lisbon-3-days");
    await page.getByRole("button", { name: "Compartir" }).click();
    await expect(page.getByRole("dialog", { name: "Compartir esta guía" }).getByRole("textbox")).toHaveValue(/\/es\/guides\/lisbon-3-days$/);
  });

  test("a route to Rome links to its guide, and the sitemap lists it", async ({ page, request }) => {
    await page.goto("/es/flights/malta-rome");
    await expect(page.getByRole("link", { name: /Qué ver en Roma/ })).toHaveAttribute("href", "/es/guides/rome-3-days");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://lowfly.travel/es/guides/rome-3-days</loc>");
    expect(sitemap).toContain("<loc>https://lowfly.travel/en/guides</loc>");
  });
});
