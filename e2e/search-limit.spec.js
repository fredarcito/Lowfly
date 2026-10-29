import { randomInt } from "node:crypto";
import { DESKTOP, expect, openWith, test } from "./helpers/test.js";
import { dayFromNow } from "./helpers/trips.js";

// How many flight searches a visitor may ask for (server/searchLimit): past it, 429 with the limit's code. The dev
// server counts in its memory and leaves its own machine out (the other tests search a lot), so these tests are
// visitors of their own: a documentation IP (RFC 3849) in x-forwarded-for, new on every run.
const visitor = () => `2001:db8::${randomInt(0xffff).toString(16)}:${randomInt(0xffff).toString(16)}`;
const PER_MINUTE = 30;
// Wrong on purpose: the limit counts before the search is checked, and nothing is asked to the airlines
const search = "/api/everywhere?origin=X";

test.describe("search limit", () => {
  test("past the searches of a minute, a visitor is refused, and only that visitor", async ({ request }) => {
    const headers = { "x-forwarded-for": visitor() };
    for (let call = 0; call < PER_MINUTE; call++) expect((await request.get(search, { headers })).status()).toBe(400);
    const refused = await request.get(search, { headers });
    expect(refused.status()).toBe(429);
    expect(await refused.json()).toMatchObject({ error: "tooManySearches" });
    // Every kind of search shares the count
    expect((await request.get("/api/country?origin=X", { headers })).status()).toBe(429);

    const someoneElse = await request.get(search, { headers: { "x-forwarded-for": visitor() } });
    expect(someoneElse.status()).toBe(400);
  });

  test.describe("in the browser", () => {
    // The refused search answers 429, which the browser logs
    test.use({ expectedErrors: /status of 429/ });

    test("a refused search tells the visitor to wait", async ({ page }) => {
      await page.setViewportSize(DESKTOP);
      await page.route("**/api/everywhere?**", (route) => route.fulfill({ status: 429, json: { error: "tooManySearches", params: {} } }));
      await openWith(page, `/es?m=everywhere&o=MLA&from=${dayFromNow(20)}&to=${dayFromNow(30)}`, { origin: "MLA" });
      await expect(page.getByText("Demasiadas búsquedas seguidas. Espera un minuto y vuelve a probar.")).toBeVisible();
    });
  });
});
