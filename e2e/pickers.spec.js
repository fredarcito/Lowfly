import { DESKTOP, PHONE, expect, openWith, test } from "./helpers/test.js";
import { serveRecordedPlaces } from "./helpers/places.js";
import { flightTrip } from "./helpers/trips.js";

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

  // Phones: the sheet opens with the list in view and no keyboard (it would cover the list, and iOS pushed the
  // sheet's top off the screen scrolling to the box); a tap on the box brings it. Desktop focuses the box at once.
  test("phones: the airport sheet opens without the keyboard, whole on the screen", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openWith(page, "/es");
    await page.locator("#origin").click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.locator("h2")).toBeInViewport();
    const search = sheet.getByRole("combobox");
    await expect(search).not.toBeFocused();
    await expect(sheet.getByRole("button", { name: /ubicación/ })).toBeVisible();
    await search.click();
    await expect(search).toBeFocused();
    await search.fill("buda");
    await expect(sheet.getByRole("option", { name: /Budapest/ })).toBeVisible();
  });

  test("desktop: the airport search is ready to type", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es");
    await page.locator("#origin").click();
    await expect(page.getByRole("combobox")).toBeFocused();
  });

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
    await serveRecordedPlaces(page);
    await openWith(page, "/es/trips/new");
    await page.locator("input[role=combobox]").first().fill("venecia");
    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.locator("form section ol > li").first()).toContainText("Venecia");
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

  // The top bar fits at every width: phones and tablets put the navigation in its own row below the logo and
  // the buttons; desktop keeps it all in one row. The tabs never run into each other, the buttons or the edge.
  test("the top bar fits from small phones to desktop", async ({ page }) => {
    await openWith(page, "/es/trips", {
      trips: Array.from({ length: 9 }, (_, index) => ({ ...flightTrip({ id: `trip-${index}` }) })),
    });
    for (let width = 320; width <= 1280; width += 20) {
      await page.setViewportSize({ width, height: 700 });
      const layout = await page.evaluate(() => {
        const navigation = document.querySelector('nav[aria-label="Navegación principal"]');
        const buttons = navigation.nextElementSibling.getBoundingClientRect();
        const tabs = [...navigation.querySelectorAll("a")].map((tab) => tab.getBoundingClientRect());
        const bar = navigation.getBoundingClientRect();
        return {
          stacked: bar.top >= buttons.bottom,
          gapToButtons: buttons.left - bar.right,
          tabGaps: tabs.slice(1).map((tab, index) => tab.left - tabs[index].right),
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      });
      expect(layout.overflow, `at ${width}px`).toBeLessThanOrEqual(0);
      expect(layout.stacked, `at ${width}px`).toBe(width < 1024);
      if (!layout.stacked) expect(layout.gapToButtons, `at ${width}px`).toBeGreaterThanOrEqual(4);
      for (const gap of layout.tabGaps) expect(gap, `at ${width}px`).toBeGreaterThanOrEqual(4);
    }
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    // The three tabs keep their names on phones; the one of this page is marked
    await page.setViewportSize({ width: 360, height: 700 });
    await expect(nav.getByRole("link", { name: "Explorar", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Crear itinerario", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Mis viajes/ })).toHaveAttribute("aria-current", "page");
  });

  test("Create itinerary in the top bar opens the planner, marked as the current tab", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es/trips");
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await nav.getByRole("link", { name: "Crear itinerario", exact: true }).click();
    await page.waitForURL("**/es/trips/new");
    await expect(nav.getByRole("link", { name: "Crear itinerario", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: /Mis viajes/ })).not.toHaveAttribute("aria-current", "page");
  });

  test("phones: theme and language live in the Settings menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openWith(page, "/es/trips", { theme: "dark" });
    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("menuitemradio", { name: "Claro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("menuitem", { name: "English" }).click();
    await page.waitForURL("**/en/trips");
  });
});
