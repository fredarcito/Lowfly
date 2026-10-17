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
    });
  }

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
