import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, openWith, test } from "./helpers/test.js";
import { createTestUser, deleteTestUser, signIn, skipWithoutSupabase } from "./helpers/accounts.js";
import { dayFromNow } from "./helpers/trips.js";

// The admin's "Uso" page (server/admin/usage): the searches by kind and how they end, told by the browser, and how
// the airlines answer, counted by their guard (server/metrics)
test.describe("usage", () => {
  test("a search tells how it ended: its kind, the outcome and whether its dates were the form's", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.route("**/api/multi-city?**", (route) => route.fulfill({ json: { origin: "MLA", routes: [], failed: [] } }));
    const reported = page.waitForRequest((request) => new URL(request.url()).pathname === "/api/metrics/search");
    await openWith(page, `/es?m=multiCity&o=MLA&from=${dayFromNow(30)}&to=${dayFromNow(39)}`, { origin: "MLA" });
    expect((await reported).postDataJSON()).toEqual({ mode: "multiCity", outcome: "empty", customDates: false });
  });

  test("anything else sent to the counter is not counted, and never answers an error", async ({ request }) => {
    for (const body of [{ mode: "nope", outcome: "results" }, { mode: "everywhere", outcome: "<script>" }, "not json"]) {
      const response = await request.post("/api/metrics/search", { data: body });
      expect(response.status()).toBe(204);
    }
  });

  test.describe("the admin's page", () => {
    const users = [];
    test.afterEach(async () => {
      await Promise.all(users.splice(0).map(deleteTestUser));
    });

    for (const viewport of [DESKTOP, PHONE]) {
      test(`searches by kind and the airlines (${viewport.width}px)`, async ({ page, request }) => {
        skipWithoutSupabase();
        // One search of each outcome counted today
        await request.post("/api/metrics/search", { data: { mode: "multiCity", outcome: "results" } });
        await request.post("/api/metrics/search", { data: { mode: "country", outcome: "noRoutes", customDates: true } });
        const user = await createTestUser({ admin: true });
        users.push(user);
        await page.setViewportSize(viewport);
        await page.goto("/es");
        await signIn(page, user);
        await page.goto("/es/admin/usage");

        await expect(page.getByRole("heading", { level: 1, name: "Uso" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Período" })).toContainText("Últimos 7 días");
        await expect(page.getByRole("heading", { name: "Búsquedas por tipo" })).toBeVisible();
        await expect(page.getByText("Recorridos", { exact: true }).first()).toBeVisible();
        await expect(page.getByRole("heading", { name: "Errores más frecuentes" })).toBeVisible();
        await expect(page.getByText("Sin vuelos a ese destino")).toBeVisible();
        await expect(page.getByRole("rowheader", { name: /Ryanair/ })).toBeVisible();
        await expect(page.getByRole("rowheader", { name: /Wizz Air/ })).toBeVisible();
        // The trend: the requests to the airlines and the problems (the searches' is on the overview)
        const trend = page.locator("section").filter({ has: page.getByRole("heading", { name: "Evolución" }) });
        await expect(trend.getByRole("tab")).toHaveText(["Peticiones", "Problemas", "Fallidas"]);
        // The searches that ended badly, as shares: one counted today found no flights
        await trend.getByRole("tab", { name: "Fallidas" }).click();
        await expect(trend.getByText(/^de \d+ búsquedas$/)).toBeVisible();
        await expect(trend.locator("li").filter({ hasText: "Sin resultados" })).toContainText("%");
        await expect(trend.locator("li").filter({ hasText: "Con error" })).toContainText("%");
        await trend.getByRole("button", { name: "Año" }).click();
        await expect(trend.getByText("Últimos 12 meses, por semanas", { exact: true })).toBeVisible();
        await expectNoSidewaysScroll(page);

        // Another period, kept in the address
        await page.getByRole("button", { name: "Período" }).click();
        await page.getByRole("menuitemradio", { name: "Últimos 30 días" }).click();
        await expect(page).toHaveURL(/period=30/);
      });
    }
  });
});
