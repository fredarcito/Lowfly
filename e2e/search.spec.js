import { DESKTOP, PHONE, TABLET, expect, openWith, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// Searching real flights (Ryanair and Wizz answer live): slow, so tagged @live
test.describe("search @live", () => {
  test.describe.configure({ timeout: 240_000 });

  // Anywhere from Malta, in the coming weeks: return (2 to 4 nights) and one way
  const everywhere = {
    return: `/es?m=everywhere&o=MLA&from=${dayFromNow(5)}&to=${dayFromNow(15)}&trip=return&min=2&maxn=4`,
    oneWay: `/es?m=everywhere&o=MLA&from=${dayFromNow(30)}&to=${dayFromNow(40)}`,
  };

  for (const viewport of [DESKTOP, PHONE]) {
    test(`to a city, picked in the destination picker (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWith(page, "/es", { origin: "BUD" });
      await page.getByRole("tab", { name: /destino/i }).click();
      const destination = page.locator("#country");
      await expect(destination).toBeEnabled({ timeout: 60_000 });
      await destination.click();
      await page.getByRole("combobox").fill("rom");
      await page.getByRole("option", { name: /^Roma/ }).click();
      await expect(destination).toContainText("Roma");
      await page.getByRole("button", { name: "Buscar" }).click();
      await expect(page.getByText("Calendario de precios")).toBeVisible({ timeout: 150_000 });
      expect(new URL(page.url()).searchParams.get("ci")).toBe("Roma");
    });
  }

  test("only weekends, to a destination", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es", { origin: "BUD" });
    await page.getByRole("tab", { name: /destino/i }).click();
    await expect(page.locator("#country")).toBeEnabled({ timeout: 60_000 });
    await page.getByRole("radio", { name: /Ida y vuelta/ }).click();
    await page.getByRole("button", { name: /Solo fines de semana/ }).click();
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByText("Calendario de precios")).toBeVisible({ timeout: 150_000 });
    expect(new URL(page.url()).searchParams.get("wk")).toBe("1");
  });

  for (const [name, url] of Object.entries(everywhere)) {
    for (const viewport of [DESKTOP, PHONE]) {
      test(`the cheapest, highlighted (${name}, ${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(url);
        // Phones and desktop each have their own version of the card: the one on screen
        await expect(page.getByText("Lo más barato").filter({ visible: true }).first()).toBeVisible({ timeout: 150_000 });
      });
    }
  }

  for (const [name, url] of Object.entries(everywhere)) {
    for (const viewport of [PHONE, TABLET, DESKTOP]) {
      test(`a destination of the table opens its details (${name}, ${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(url);
        await expect(page.getByText(/destinos/).first()).toBeVisible({ timeout: 150_000 });
        const table = page.locator("section").filter({ hasText: "destinos" }).filter({ visible: true }).last();
        const row = table.locator("button[aria-expanded]").first();
        await row.scrollIntoViewIfNeeded();
        await row.click();
        await expect(row).toHaveAttribute("aria-expanded", "true");
        // Phones and tablets: each flight and the baggage fold open
        if (viewport.width < 1000) {
          const details = row.locator("xpath=..");
          await details.getByRole("button", { name: /^Ida/ }).filter({ visible: true }).first().click();
          await details.getByRole("button", { name: /Equipaje adicional/ }).filter({ visible: true }).first().click();
        }
      });
    }
  }

  test("weekend deals load their photos in one request and lead to every destination", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1100 });
    const photoRequests = [];
    page.on("request", (request) => request.url().includes("/api/photos") && photoRequests.push(request.url()));
    await openWith(page, "/es", { origin: "MLA" });
    await expect(page.locator("article h3").first()).toBeVisible({ timeout: 120_000 });
    await expect(page.locator("article img").first()).toBeVisible();
    // Batched: the cards that appear together ask in one request (they can come in two rounds)
    expect(photoRequests.length).toBeLessThan(await page.locator("article").count());
    await page.getByRole("button", { name: /Ver todos los destinos/ }).click();
    await expect(page.getByText(/destinos/).first()).toBeVisible({ timeout: 150_000 });
    const params = new URL(page.url()).searchParams;
    expect(params.get("m")).toBe("everywhere");
    expect(params.get("wk")).toBe("1");
  });
});
