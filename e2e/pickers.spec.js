import { DESKTOP, PHONE, expect, openWith, test } from "./helpers/test.js";

// The search form's pickers: a popover on desktop, a sheet from the bottom on phones, and the keyboard
test.describe("pickers", () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`airport and dates (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWith(page, "/es");
      await page.locator("#origin").click();
      // Phones: a sheet with its own title
      if (viewport === PHONE) await expect(page.getByRole("dialog").locator("h2")).toBeVisible();
      await page.getByRole("combobox").fill("roma");
      await page.keyboard.press("Enter");
      await expect(page.locator("#origin")).toContainText("Roma");
      await page.locator("#dates").click();
      await expect(page.getByRole("grid").first()).toBeVisible();
    });
  }

  test("airport and destination with the keyboard", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es");
    await page.locator("#origin").click();
    await page.getByRole("combobox").fill("buda");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await expect(page.locator("#origin")).toContainText("Budapest");

    await page.getByRole("tab", { name: /destino/i }).click();
    await expect(page.locator("#country")).toBeEnabled({ timeout: 60_000 });
    await page.locator("#country").click();
    await page.getByRole("combobox").fill("roma");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.locator("#country")).toContainText("Roma");
  });

  test("a town in the trip planned by hand: Escape closes the list, arrows and Enter pick", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es/trips/new");
    await page.locator("input[role=combobox]").first().fill("venecia");
    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.locator("form ol > li").first()).toContainText("Venecia");
  });

  test("the search starts as a return trip; an old shared link without a trip type is one way", async ({ page }) => {
    await openWith(page, "/es");
    await expect(page.getByRole("radio", { name: /Ida y vuelta/ })).toBeChecked();
    // Past dates: the link fills the form without searching
    await page.goto("/es?m=everywhere&o=MLA&from=2020-01-01&to=2020-01-10");
    await expect(page.getByRole("radio", { name: /Solo ida/ })).toBeChecked();
    await page.goto("/es?m=everywhere&o=MLA&from=2020-01-01&to=2020-01-10&trip=return&min=2&maxn=4");
    await expect(page.getByRole("radio", { name: /Ida y vuelta/ })).toBeChecked();
  });
});
