import { DESKTOP, NOT_FOUND_ERRORS, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";

// The route pages for search engines (/es/flights/malta-barcelona): the route's lowest price, the cheapest flight of
// each coming month, the search already filled in, the other routes; in the sitemap. They show what the cron last
// saved (/api/cron/flight-routes), never asking the airlines themselves.
test.describe("route pages' cron", () => {
  test("only Vercel Cron may call it: without its secret, 401", async ({ request }) => {
    expect((await request.get("/api/cron/flight-routes")).status()).toBe(401);
    const wrong = await request.get("/api/cron/flight-routes", { headers: { authorization: "Bearer wrong" } });
    expect(wrong.status()).toBe(401);
  });

  // Real prices from the airlines: slow, so @live
  test("it writes an airport's routes and their prices, and the page shows them @live", async ({ request, page }) => {
    test.skip(!process.env.CRON_SECRET, "CRON_SECRET is not set (.env.local)");
    test.setTimeout(120_000);
    const response = await request.get("/api/cron/flight-routes?origin=MLA", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      timeout: 110_000,
    });
    expect(response.status()).toBe(200);
    const { done, errors } = await response.json();
    expect(errors).toEqual([]);
    expect(done).toHaveLength(1);
    expect(done[0]).toMatchObject({ origin: "MLA", failed: [] });
    expect(done[0].routes).toBeGreaterThan(30);
    // The page: its cheapest month and flight time, from what was just saved (the weekday is no longer shown)
    await page.goto("/es/flights/malta-barcelona");
    const facts = page.getByRole("heading", { name: "Ficha de la ruta" }).locator("..");
    await expect(facts).toContainText("Mes más barato");
    await expect(facts).toContainText("Duración del vuelo");
    await expect(facts).not.toContainText("Día más barato");
  });
});

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
      // The destination's photo says what it shows, for image search
      await expect(page.locator('img[alt="Vista de Barcelona"]')).toHaveCount(1);
      // A month opens the search for it, already filled in
      const months = page.getByRole("heading", { name: "Cuándo es más barato volar" }).locator("..").locator("..").getByRole("link");
      expect(await months.count()).toBeGreaterThan(2);
      await expect(months.first()).toHaveAttribute("href", /m=country&o=MLA&c=Espa%C3%B1a&ci=Barcelona/);
      await expect(page.getByRole("link", { name: "Ver fechas y precios" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Ficha de la ruta" })).toBeVisible();
      // The itinerary: the trip planner with Barcelona already its first town
      const plan = page.getByRole("heading", { name: "¿Planeas tu viaje?" }).locator("../../..");
      await expect(plan.getByRole("link", { name: /Crear itinerario/ })).toHaveAttribute("href", "/es/trips/new?to=BCN");
      // The other routes from Malta, each its own page
      await expect(page.getByRole("link", { name: "Atenas", exact: true })).toHaveAttribute("href", "/es/flights/malta-athens");
      await expect(page.getByRole("link", { name: /Ver todos los destinos/ })).toHaveAttribute("href", "/es/flights/malta");
      await expectNoSidewaysScroll(page);
    });
  }

  test("a route answers the usual questions with its own figures, the same ones search engines get @live", async ({ page }) => {
    await page.goto("/es/flights/madrid-london");
    const faq = page.getByRole("heading", { name: "Preguntas frecuentes sobre los vuelos de Madrid a Londres" }).locator("..");
    await expect(faq.getByRole("heading", { name: "¿Cuánto cuesta volar de Madrid a Londres?" })).toBeVisible();
    await expect(faq.getByText(/^El vuelo más barato de los próximos seis meses cuesta [\d,]+\s€ solo ida por persona/)).toBeVisible();
    // Several airports: each by its name
    await expect(faq.getByText(/Londres Stansted \(STN\)/)).toBeVisible();
    await expect(faq.getByRole("link", { name: /Crear itinerario/ })).toHaveAttribute("href", "/es/trips/new?to=STN");
    // FAQPage: the very questions and answers on the page
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((block) => JSON.parse(block));
    const faqPage = blocks.find((block) => block["@type"] === "FAQPage");
    const shown = await faq.getByRole("heading", { level: 3 }).allTextContents();
    expect(faqPage.mainEntity.map((question) => question.name)).toEqual(shown);
    for (const question of faqPage.mainEntity) await expect(faq.getByText(question.acceptedAnswer.text, { exact: true })).toBeVisible();
  });

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

  // Its own picture when shared (the route and its price over the photo), as JPEG and light: WhatsApp drops
  // previews over ~300 KB
  for (const path of ["/es/flights/malta-barcelona", "/es/flights/malta"]) {
    test(`${path}: its own preview picture`, async ({ page, request }) => {
      await page.goto(path);
      const image = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(new URL(image).pathname).toBe(`${path}/opengraph-image`);
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", image);
      const response = await request.get(new URL(image).pathname);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/jpeg");
      expect((await response.body()).length).toBeLessThan(300_000);
    });
  }

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
