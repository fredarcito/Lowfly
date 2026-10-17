import { DESKTOP, NOT_FOUND_ERRORS, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";

// A page that does not exist: our own "not found" page, in the app's design and the address's language, with the
// ways back (search flights, my trips); still a 404 for search engines
test.describe("not found", () => {
  test.use({ expectedErrors: NOT_FOUND_ERRORS });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`an unknown address (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto("/es/esto-no-existe");
      expect(response.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: "Nos hemos salido de ruta" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Buscar vuelos" })).toHaveAttribute("href", "/es");
      await expect(page.getByRole("link", { name: "Mis viajes" }).last()).toHaveAttribute("href", "/es/trips");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expectNoSidewaysScroll(page);
      // The footer sits at the bottom of a page this short
      const footer = await page.getByRole("contentinfo").boundingBox();
      expect(Math.round(footer.y + footer.height)).toBe(viewport.height);
    });
  }

  // The browser builds a "not found" page by itself (Next sends no HTML for it): the saved theme still shows
  test("keeps the saved light theme", async ({ page }) => {
    await page.goto("/es/esto-no-existe");
    await page.evaluate(() => localStorage.setItem("lowfly.theme", "light"));
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("in English, and for a route we do not publish", async ({ page }) => {
    const response = await page.goto("/en/flights/malta-nowhere");
    expect(response.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "We've gone off route" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Search flights" })).toHaveAttribute("href", "/en");
  });
});
