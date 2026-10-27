import { DESKTOP, PHONE, TABLET, expect, openWith, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// Searching real flights (Ryanair and Wizz answer live): slow, so tagged @live
test.describe("search @live", () => {
  test.describe.configure({ timeout: 240_000 });

  // Anywhere from Malta, in the coming weeks: return (2 to 4 nights) and one way. Each kind of search has its page
  // (constants/searchPages)
  const ANYWHERE = "/es/a-cualquier-sitio";
  const everywhere = {
    return: `${ANYWHERE}?o=MLA&from=${dayFromNow(5)}&to=${dayFromNow(15)}&trip=return&min=2&maxn=4`,
    oneWay: `${ANYWHERE}?o=MLA&from=${dayFromNow(30)}&to=${dayFromNow(40)}`,
  };
  // The results' price calendar (the search modes' descriptions mention one too)
  const priceCalendar = (page) => page.getByText("Calendario de precios", { exact: true });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`to a city, picked in the destination picker (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWith(page, "/es", { origin: "BUD" });
      await page.getByRole("tab", { name: /destino/i }).click();
      const destination = page.locator("#country");
      await expect(destination).toBeEnabled({ timeout: 60_000 });
      await destination.click();
      await page.locator('input[role="combobox"]').fill("rom");
      await page.getByRole("option", { name: /^Roma/ }).click();
      await expect(destination).toContainText("Roma");
      await page.getByRole("button", { name: "Buscar" }).click();
      await expect(priceCalendar(page)).toBeVisible({ timeout: 150_000 });
      // The address keeps the search (written as the results come, so waited for)
      await expect(page).toHaveURL(/[?&]ci=Roma(&|$)/);
    });
  }

  test("only weekends, to a destination", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es", { origin: "BUD" });
    await page.getByRole("tab", { name: /destino/i }).click();
    const destination = page.locator("#country");
    await expect(destination).toBeEnabled({ timeout: 60_000 });
    // Rome, which has weekend flights from Budapest (the first country listed may have none)
    await destination.click();
    await page.locator('input[role="combobox"]').fill("rom");
    await page.getByRole("option", { name: /^Roma/ }).click();
    await page.getByRole("radio", { name: /Ida y vuelta/ }).click();
    await page.getByRole("button", { name: /Solo findes/ }).click();
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(priceCalendar(page)).toBeVisible({ timeout: 150_000 });
    await expect(page).toHaveURL(/[?&]wk=1(&|$)/);
  });

  for (const [name, url] of Object.entries(everywhere)) {
    for (const viewport of [DESKTOP, PHONE]) {
      test(`the cheapest, highlighted (${name}, ${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(url);
        // Phones and desktop each have their own version of the card: the one on screen
        await expect(page.getByText("Lo más barato").filter({ visible: true }).first()).toBeVisible({ timeout: 150_000 });
        // Saving says we plan the itinerary, then offers it without leaving the search
        await expect(page.getByText("Y te preparamos el itinerario día a día").filter({ visible: true }).first()).toBeVisible();
        await page.getByRole("button", { name: "Guardar viaje" }).filter({ visible: true }).first().click();
        await expect(page.getByRole("link", { name: "Prepárame el itinerario" }).filter({ visible: true }).first()).toBeVisible();
        expect(new URL(page.url()).pathname).toBe(ANYWHERE);
      });
    }
  }

  for (const [name, url] of Object.entries(everywhere)) {
    for (const viewport of [PHONE, TABLET, DESKTOP]) {
      test(`a destination of the table opens its details (${name}, ${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(url);
        await expect(page.getByRole("heading", { name: /^\d+ destinos?$/ })).toBeVisible({ timeout: 150_000 });
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

  test("weekend deals load their photos and lead to every destination", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1100 });
    // The photos this page asked for. A new page starts the count again, and so does the dev server's Fast Refresh
    // (it runs the app's code again, its photo cache with it, when other tests make it rebuild): neither is the app's
    let photoRequests = [];
    page.on("domcontentloaded", () => (photoRequests = []));
    page.on("console", (message) => message.text().startsWith("[Fast Refresh] rebuilding") && (photoRequests = []));
    page.on("request", (request) => new URL(request.url()).pathname === "/api/photos" && photoRequests.push(request.url()));
    await openWith(page, "/es", { origin: "MLA" });
    await expect(page.locator("article h3").first()).toBeVisible({ timeout: 120_000 });
    await expect(page.locator("article img").first()).toBeVisible();
    // One request per airport (each photo shows as soon as it is found), never twice for the same one
    expect(new Set(photoRequests).size).toBe(photoRequests.length);
    await page.getByRole("button", { name: /Ver todos los destinos/ }).click();
    await expect(page.getByRole("heading", { name: /^\d+ destinos?$/ })).toBeVisible({ timeout: 150_000 });
    // From the home, to the search's own page, with the weekends in the address (written as the search starts)
    await expect(page).toHaveURL(/\/es\/a-cualquier-sitio\?(.*&)?wk=1(&|$)/);
  });
});

// More airlines (easyJet, Vueling…) from Travelpayouts' recent searches: shown with their name, a note that the
// airline confirms the price, and booking on the airline's own site (never an agency)
test.describe("more airlines @live", () => {
  test.skip(!process.env.TRAVELPAYOUTS_TOKEN, "TRAVELPAYOUTS_TOKEN is not set (.env.local)");

  test("anywhere from Gatwick finds easyJet, booked on its own site", async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize(DESKTOP);
    await page.goto(`/es?m=everywhere&o=LGW&from=${dayFromNow(7)}&to=${dayFromNow(60)}&trip=oneway`);
    const row = page.getByRole("button").filter({ has: page.getByText("easyJet", { exact: true }) }).first();
    await row.waitFor({ timeout: 200_000 });
    await row.click();
    await expect(page.getByText(/Precio visto en búsquedas recientes: confírmalo en easyJet/).filter({ visible: true }).first()).toBeVisible();
    const booking = page.getByRole("link", { name: /Reservar en easyJet/ }).first();
    await expect(booking).toHaveAttribute("href", /^https:\/\/www\.easyjet\.com\//);
    // The closed rows' details take no room: the list is followed right away by the site's foot
    await row.click();
    await page.waitForTimeout(600);
    const room = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      const footerStart = footer.getBoundingClientRect().top - parseFloat(getComputedStyle(footer).marginTop);
      return footerStart - document.querySelector("main").getBoundingClientRect().bottom;
    });
    expect(room).toBeLessThanOrEqual(1);
  });
});

// While a search runs: a plane flying from the departure airport, the search's text and playful phrases (never an
// airline's name). The search is held back, so no airline is asked.
test.describe("search loader", () => {
  for (const viewport of [DESKTOP, PHONE]) {
    test(`a plane leaves the departure airport while searching (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.route("**/api/everywhere**", () => {});
      await page.goto(`/es?m=everywhere&o=BUD&from=${dayFromNow(20)}&to=${dayFromNow(35)}`);
      const loader = page.getByRole("status").filter({ hasText: "Buscando los destinos más baratos" });
      await expect(loader).toBeVisible({ timeout: 60_000 });
      await expect(loader.locator("svg text").first()).toHaveText("BUD");
      await expect(loader.locator("svg animateMotion")).toHaveCount(1);
      await expect(loader).not.toContainText(/Ryanair|Wizz|easyJet|Vueling/);
    });
  }

  test("with reduced motion, the plane waits mid-way", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/everywhere**", () => {});
    await page.goto(`/es?m=everywhere&o=BUD&from=${dayFromNow(20)}&to=${dayFromNow(35)}`);
    const loader = page.getByRole("status").filter({ hasText: "Buscando los destinos más baratos" });
    await expect(loader).toBeVisible({ timeout: 60_000 });
    await expect(loader.locator("svg animateMotion")).toHaveCount(0);
  });
});
