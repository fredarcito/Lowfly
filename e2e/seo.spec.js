import { NOT_FOUND_ERRORS, expect, test } from "./helpers/test.js";

// What search engines read: every page says its own address and its other language (none claims to be the home),
// the visitor's own pages stay out of the results, and robots.txt lets them read a shared trip's noindex
test.describe("seo", () => {
  const PAGES = [
    ["/es", "/es", "/en"],
    ["/es/privacy", "/es/privacy", "/en/privacy"],
    ["/en/terms", "/en/terms", "/en/terms"],
    ["/es/flights", "/es/flights", "/en/flights"],
    // The planner is one page, whatever town it starts with
    ["/es/trips/new?to=BCN", "/es/trips/new", "/en/trips/new"],
  ];
  for (const [path, canonical, english] of PAGES) {
    test(`${path}: its own address and its English one`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${canonical.replace(/\//g, "\\/")}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", new RegExp(`${english.replace(/\//g, "\\/")}$`));
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      // Any other language: the address without one, which sends the visitor to theirs
      const anyLanguage = canonical.replace(/^\/(es|en)/, "") || "";
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", new RegExp(`:\\d+${anyLanguage.replace(/\//g, "\\/")}\\/?$`));
    });
  }

  // The structured data in the page (schema.org JSON-LD): every block, parsed
  const structuredData = async (page) => (await page.locator('script[type="application/ld+json"]').allTextContents()).map((block) => JSON.parse(block));

  test("the home says who Lowfly is: the site and its organisation, with its logo", async ({ page }) => {
    await page.goto("/es");
    const [site] = await structuredData(page);
    const types = site["@graph"].map((node) => node["@type"]);
    expect(types).toEqual(["WebSite", "Organization"]);
    expect(site["@graph"][1]).toMatchObject({ name: "Lowfly", url: "https://lowfly.travel", logo: "https://lowfly.travel/apple-icon.png" });
  });

  test("a route's page says the way to it: Lowfly › airports › its airport › the route", async ({ page }) => {
    await page.goto("/es/flights/malta-barcelona");
    const [breadcrumbs] = await structuredData(page);
    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement.map((step) => step.name)).toEqual([
      "Lowfly",
      "Vuelos baratos por aeropuerto",
      "Vuelos baratos desde Malta",
      "Vuelos baratos de Malta a Barcelona",
    ]);
    expect(breadcrumbs.itemListElement.map((step) => step.item)).toEqual([
      "https://lowfly.travel/es",
      "https://lowfly.travel/es/flights",
      "https://lowfly.travel/es/flights/malta",
      "https://lowfly.travel/es/flights/malta-barcelona",
    ]);
  });

  test("the sitemap lists every page in each language, with x-default and when its prices were written", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://lowfly.travel/en/flights/malta-barcelona</loc>");
    expect(sitemap).toContain('hreflang="x-default" href="https://lowfly.travel/flights/malta-barcelona"');
    const route = sitemap.split("<url>").find((entry) => entry.includes("<loc>https://lowfly.travel/es/flights/malta-barcelona</loc>"));
    expect(route).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T/);
  });

  for (const [path, title] of [
    ["/es/trips", "Mis viajes · Lowfly"],
    ["/es/login", "Entrar · Lowfly"],
  ]) {
    test(`${path}: the visitor's own, out of search results`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path.replace(/\//g, "\\/")}$`));
    });
  }

  test.describe("a shared trip", () => {
    test.use({ expectedErrors: NOT_FOUND_ERRORS });
    test("says noindex itself, and robots.txt lets search engines read it", async ({ page, request }) => {
      const robots = await (await request.get("/robots.txt")).text();
      expect(robots).not.toContain("/shared/");
      expect(robots).toContain("Disallow: /es/admin");
      await page.goto("/es/shared/not-a-share");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
    });
  });
});
