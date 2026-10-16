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
      await expect(page.getByRole("heading", { name: "Panel" })).toHaveCount(0);
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
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("AI cost", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Itineraries per day" })).toBeVisible();
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
      await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
      for (const figure of ["Cuentas", "Itinerarios", "Coste de IA", "Hechos por Claude"]) await expect(page.getByText(figure, { exact: true })).toBeVisible();
      for (const chart of ["Itinerarios por día", "Coste de IA por día", "Altas por día", "Destinos más planeados"])
        await expect(page.getByRole("heading", { name: chart })).toBeVisible();
      // Search engines leave it out
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expectNoSidewaysScroll(page);
      // The page ends with its content (the screen readers' tables take no room)
      const room = await page.evaluate(() => document.documentElement.scrollHeight - (document.querySelector("main").getBoundingClientRect().bottom + window.scrollY));
      expect(room).toBeLessThanOrEqual(1);
    });
  }
});
