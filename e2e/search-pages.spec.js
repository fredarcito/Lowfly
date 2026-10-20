import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, openWith, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// Each kind of search has its own page, named in each language (constants/searchPages, constants/sections): its own
// headline and title, the tabs move between them keeping what was typed, and links from before the pages still work
test.describe("search pages", () => {
  // In the order clicked from the home (which already searches "anywhere": its tab is the one picked there)
  const PAGES = [
    ["A un destino", "/es/a-un-destino", /Ya sabes adónde\.\s*Te decimos cuándo\./],
    ["Fechas flexibles", "/es/fechas-flexibles", /Tus fechas,\s*un poco más baratas\./],
    ["Recorridos", "/es/recorridos", /Tú pones los días\.\s*Nosotros, el recorrido\./],
    // The home's headline: the same form never shows two
    ["A cualquier sitio", "/es/a-cualquier-sitio", /No elijas destino\.\s*Elige el mejor precio\./],
  ];

  test("the tabs go to each kind's page, with its headline, and keep the airport chosen", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openWith(page, "/es", { origin: "MLA" });
    await expect(page.locator("#origin")).toContainText("Malta");
    for (const [tab, address, heading] of PAGES) {
      await page.getByRole("tab", { name: new RegExp(tab) }).click();
      await expect(page).toHaveURL(new RegExp(`${address}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.getByRole("tab", { name: new RegExp(tab) })).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#origin")).toContainText("Malta");
    }
    // Back: the kind before
    await page.goBack();
    await expect(page).toHaveURL(/\/es\/recorridos$/);
    await expect(page.getByRole("tab", { name: /Recorridos/ })).toHaveAttribute("aria-selected", "true");
  });

  test("a page opened straight away shows its kind; in English, its English name", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openWith(page, "/en/multi-city", { origin: "MLA" });
    await expect(page.getByRole("tab", { name: /Routes/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Which days are you free?")).toBeVisible();
    await expectNoSidewaysScroll(page);
    // The other language's name for it goes to this language's
    await page.goto("/en/recorridos");
    await expect(page).toHaveURL(/\/en\/multi-city$/);
  });

  test("a search from the home moves to its kind's page, with the search in the address", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.route("**/api/multi-city?**", (route) => route.fulfill({ json: { origin: "MLA", routes: [], failed: [] } }));
    await openWith(page, "/es", { origin: "MLA" });
    await page.getByRole("tab", { name: /Recorridos/ }).click();
    await page.getByRole("button", { name: /^Buscar/ }).click();
    await expect(page).toHaveURL(/\/es\/recorridos\?o=MLA&from=\d{4}-\d{2}-\d{2}&to=\d{4}-\d{2}-\d{2}$/);
  });

  test("a link from before the pages (?m=…) opens its kind's page with the same search", async ({ page }) => {
    await page.route("**/api/multi-city?**", (route) => route.fulfill({ json: { origin: "MLA", routes: [], failed: [] } }));
    const from = dayFromNow(30);
    const to = dayFromNow(39);
    await openWith(page, `/es?m=multiCity&o=MLA&from=${from}&to=${to}`, { origin: "MLA" });
    await expect(page).toHaveURL(new RegExp(`/es/recorridos\\?o=MLA&from=${from}&to=${to}$`));
    await expect(page.getByRole("tab", { name: /Recorridos/ })).toHaveAttribute("aria-selected", "true");
  });

  test("before searching, each kind links to its page", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.route("**/api/deals?**", (route) => route.fulfill({ json: { trips: [] } }));
    await openWith(page, "/es", { origin: "MLA" });
    const modes = page.getByRole("heading", { name: "Cuatro formas de buscar" }).locator("..");
    if (await modes.count()) await expect(modes.getByRole("link", { name: /Recorridos/ })).toHaveAttribute("href", "/es/recorridos");
  });

  // Their content is the layout's (the search), so each page marks its top: a link from the bottom of another page
  // opens the search at the top, as any other page (Next.js only scrolls to a page's own first element)
  for (const viewport of [DESKTOP, PHONE]) {
    test(`a link from the bottom of a guide opens the search at the top (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/es/recorridos/italia-clasica");
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
      await page.getByRole("link", { name: "Descubre más recorridos como este al mejor precio" }).click();
      await expect(page).toHaveURL(/\/es\/recorridos$/);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    });
  }
});
