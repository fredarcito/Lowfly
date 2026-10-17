import { DESKTOP, NOT_FOUND_ERRORS, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";

// The route pages for search engines (/es/flights/malta-barcelona): the route's lowest price, the cheapest flight of
// each coming month, the search already filled in, the other routes; in the sitemap
test.describe("route pages", () => {
  test.describe("not published", () => {
    test.use({ expectedErrors: NOT_FOUND_ERRORS });
    test("a route we do not publish: not found", async ({ page }) => {
      const response = await page.goto("/es/flights/malta-nowhere");
      expect(response.status()).toBe(404);
    });
  });

  // Real prices from the airlines: slow, so @live
  for (const viewport of [DESKTOP, PHONE]) {
    test(`Malta to Barcelona (${viewport.width}px) @live`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      await page.goto("/es/flights/malta-barcelona");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vuelos baratos de Malta a Barcelona");
      await expect(page).toHaveTitle(/Vuelos baratos de Malta a Barcelona desde [\d,]+\s€ · Lowfly/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/es\/flights\/malta-barcelona$/);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en\/flights\/malta-barcelona$/);
      // A month opens the search for it, already filled in
      const months = page.getByRole("heading", { name: "Cuándo es más barato volar" }).locator("..").locator("..").getByRole("link");
      expect(await months.count()).toBeGreaterThan(2);
      await expect(months.first()).toHaveAttribute("href", /m=country&o=MLA&c=Espa%C3%B1a&ci=Barcelona/);
      await expect(page.getByRole("link", { name: "Ver fechas y precios" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Ficha de la ruta" })).toBeVisible();
      // The itinerary: the trip planner with Barcelona already its first town
      await expect(page.getByRole("link", { name: /Crear itinerario/ })).toHaveAttribute("href", "/es/trips/new?to=BCN");
      // The other routes from Malta, each its own page
      await expect(page.getByRole("link", { name: "Atenas", exact: true })).toHaveAttribute("href", "/es/flights/malta-athens");
      await expect(page.getByRole("link", { name: /Ver todos los destinos/ })).toHaveAttribute("href", "/es/flights/malta");
      await expectNoSidewaysScroll(page);
    });
  }

  test("Malta's page: every destination by region, with its price @live", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/es/flights/malta");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vuelos baratos desde Malta");
    await expect(page.getByRole("heading", { name: "Europa del Sur" })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Barcelona .+€/ })).toHaveAttribute("href", "/es/flights/malta-barcelona");
    await expectNoSidewaysScroll(page);
  });

  test("the airports' page: every airport by country, Spain's and Malta @live", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/es/flights");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vuelos baratos por aeropuerto");
    await expect(page.getByRole("heading", { name: "España" })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Madrid MAD/ })).toHaveAttribute("href", "/es/flights/madrid");
    await expect(page.getByRole("link", { name: /^Malta MLA/ })).toHaveAttribute("href", "/es/flights/malta");
    await expectNoSidewaysScroll(page);
  });

  test("a route from Spain: Madrid to Palma @live", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/es/flights/madrid-palma");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vuelos baratos de Madrid a Palma");
    await expect(page.getByRole("link", { name: /Ver todos los destinos/ })).toHaveAttribute("href", "/es/flights/madrid");
  });

  test("every page's footer links to the airports' page", async ({ page }) => {
    await page.goto("/es/privacy");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Vuelos baratos por aeropuerto" })).toHaveAttribute("href", "/es/flights");
  });

  test("Create itinerary opens the planner with the destination already chosen", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/trips/new?to=BCN");
    const firstTown = page.locator("form section ol > li").first();
    await expect(firstTown).toContainText("Barcelona");
    await expect(firstTown.getByRole("button", { name: "Cambiar de ciudad" })).toBeVisible();
  });

  test("the sitemap lists the route pages in both languages @live", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("https://lowfly.travel/es/flights/malta-barcelona");
    expect(sitemap).toContain("https://lowfly.travel/es/flights/malta</loc>");
    expect(sitemap).toContain("https://lowfly.travel/es/flights</loc>");
    expect(sitemap).toContain("https://lowfly.travel/es/flights/madrid-palma</loc>");
    expect(sitemap).toContain('hreflang="en" href="https://lowfly.travel/en/flights/malta-barcelona"');
  });
});
