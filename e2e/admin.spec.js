import { DESKTOP, NOT_FOUND_ERRORS, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";
import { createTestUser, deleteTestUser, signIn, skipWithoutSupabase } from "./helpers/accounts.js";

// The admin's figures at /admin: only for accounts with the admin role; anyone else finds nothing there
test.describe("admin", () => {
  const users = [];
  test.afterEach(async () => {
    await Promise.all(users.splice(0).map(deleteTestUser));
  });

  // Signed in as a new account (an admin with `admin`)
  const signInAs = async (page, options) => {
    const user = await createTestUser(options);
    users.push(user);
    await page.goto("/es");
    await signIn(page, user);
  };

  test.describe("not found", () => {
    test.use({ expectedErrors: NOT_FOUND_ERRORS });

    test("without an account", async ({ page }) => {
      const response = await page.goto("/es/admin");
      expect(response.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "Resumen" })).toHaveCount(0);
    });

    test("with an account that is not an admin", async ({ page }) => {
      skipWithoutSupabase();
      await signInAs(page);
      const response = await page.goto("/es/admin");
      expect(response.status()).toBe(404);
    });
  });

  // In the page's language: English at /en/admin, numbers and dates too
  test("in English", async ({ page }) => {
    skipWithoutSupabase();
    await signInAs(page, { admin: true });
    await page.goto("/en/admin");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.locator("dt").getByText("Estimated AI cost", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daily trend" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Period" })).toContainText("Last 30 days");
    await expect(page.getByRole("link", { name: "Back to Lowfly" })).toBeVisible();
    await page.getByRole("link", { name: "Users" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Users" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search users" })).toBeVisible();
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`an admin sees the figures (${viewport.width}px)`, async ({ page }) => {
      skipWithoutSupabase();
      await page.setViewportSize(viewport);
      await signInAs(page, { admin: true });
      const response = await page.goto("/es/admin");
      expect(response.status()).toBe(200);
      await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
      for (const figure of ["Cuentas", "Viajes guardados", "Itinerarios creados", "Coste estimado de IA", "Generados con Claude"])
        await expect(page.locator("dt").getByText(figure, { exact: true })).toBeVisible();
      for (const section of ["Evolución diaria", "Destinos más planeados", "Uso de IA"]) await expect(page.getByRole("heading", { name: section })).toBeVisible();
      // Itineraries with and without an account
      await expect(page.getByText(/^Sin cuenta: \d+ \(\d+\s?%\)$/)).toBeVisible();
      await expect(page.locator("dd").getByText(/^Con cuenta .+ · Sin cuenta .+$/)).toBeVisible();
      await expect(page.locator("ul").getByText("Sin cuenta", { exact: true })).toBeVisible();
      // One chart, a figure at a time
      await page.getByRole("tab", { name: "Coste IA" }).click();
      await expect(page.getByRole("tab", { name: "Coste IA" })).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("p").getByText("Coste de IA", { exact: true })).toBeVisible();
      // The period, for every figure, kept in the address
      await page.getByRole("button", { name: "Período" }).click();
      await page.getByRole("menuitemradio", { name: "Últimos 7 días" }).click();
      await page.waitForURL(/period=7/);
      await expect(page.getByRole("button", { name: "Período" })).toContainText("Últimos 7 días");
      await expect(page.getByText(/vs\. los 7 días anteriores/)).toBeVisible();
      // Search engines leave it out
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expectNoSidewaysScroll(page);
      // The page ends with its content (the screen readers' tables take no room)
      const room = await page.evaluate(() => document.documentElement.scrollHeight - (document.querySelector("main").getBoundingClientRect().bottom + window.scrollY));
      expect(room).toBeLessThanOrEqual(1);
    });
  }
});
