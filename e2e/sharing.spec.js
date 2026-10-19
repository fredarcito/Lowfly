import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, openWith, savedTrips, test } from "./helpers/test.js";
import { accountTrips, createTestUser, deleteTestUser, shareTripAs, signIn, skipWithoutSupabase } from "./helpers/accounts.js";
import { FLORENCE_VENICE_ITINERARY, flightTrip, manualTrip, romeTrip } from "./helpers/trips.js";

// Sharing a trip by link: the owner's dialog, the read-only page anyone can open, and keeping a shared trip
test.describe("sharing", () => {
  skipWithoutSupabase();

  // One account shares a trip to Rome with its itinerary for the whole file
  let owner;
  let shareId;
  const trip = romeTrip({ id: "shared-rome-test" });

  test.beforeAll(async () => {
    owner = await createTestUser({ fullName: "Tester Lowfly" });
    shareId = await shareTripAs(owner, trip);
  });

  test.afterAll(async () => {
    if (owner) await deleteTestUser(owner);
  });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`the shared page is read only (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openWith(page, `/es/shared/${shareId}`);
      await expect(page.getByText("Tester te comparte su viaje")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Roma");
      await expect(page.getByRole("tab", { name: /Día 1/ })).toBeVisible();
      // Nothing that is only the owner's
      await expect(page.getByText("Marcar como visitado")).toHaveCount(0);
      await expect(page.getByText(/¿Ya reservaste/)).toHaveCount(0);
      await expect(page.getByText("Volver a Mis viajes")).toHaveCount(0);
      // Neither tab of the menu is marked
      await expect(page.locator('nav[aria-label="Navegación principal"] a[aria-current="page"]')).toHaveCount(0);
      await expectNoSidewaysScroll(page);
    });
  }

  test("its preview image and its title", async ({ page, request }) => {
    const image = await request.get(`/es/shared/${shareId}/opengraph-image`);
    expect(image.status()).toBe(200);
    // JPEG and light: WhatsApp drops previews over ~300 KB
    expect(image.headers()["content-type"]).toBe("image/jpeg");
    expect((await image.body()).length).toBeLessThan(300_000);
    await page.goto(`/es/shared/${shareId}`);
    await expect(page).toHaveTitle(/Roma · 3 noches/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    // What Discord, Slack and X need for a full card
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Lowfly");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", new RegExp(`/es/shared/${shareId}$`));
  });

  test("a link that was turned off", async ({ page }) => {
    await page.goto("/es/shared/abcdefghijkl");
    await expect(page.getByText("Este enlace ya no está disponible")).toBeVisible();
  });

  test("phones: the guide folds to two lines and opens smoothly", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto(`/es/shared/${shareId}`);
    const toggle = page.getByRole("button", { name: "Ver más" });
    await expect(toggle).toBeVisible({ timeout: 30_000 });
    const guide = page.locator("p").filter({ has: page.locator('a:has-text("Fuente")') }).first();
    const height = () => guide.evaluate((element) => Math.round(element.getBoundingClientRect().height));
    const folded = await height();
    await toggle.click();
    await expect.poll(height).toBeGreaterThan(folded);
    await page.getByRole("button", { name: "Ver menos" }).click();
    await expect.poll(height).toBe(folded);
  });

  test("desktop: no fold, and Save stays at hand next to the stuck day tabs", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/es/shared/${shareId}`);
    await expect(page.getByText("Fuente").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Ver más" })).toBeHidden();
    const aside = page.locator('[role="tablist"] + div');
    await expect(aside).toHaveCSS("opacity", "0");
    await page.mouse.wheel(0, 900);
    await expect(aside).toHaveCSS("opacity", "1");
    await expect(aside.getByRole("button", { name: "Guardar en mis viajes" })).toBeVisible();
  });

  // A route of several towns: its name next to the stuck tabs is cut at its end ("…"), never at its start
  test("desktop: a long route's name next to the stuck day tabs is cut at its end", async ({ page }) => {
    const base = manualTrip({ id: "shared-long-route", itinerary: FLORENCE_VENICE_ITINERARY });
    const city = "Florencia → San Gimignano → Montepulciano → Venecia";
    const longShareId = await shareTripAs(owner, { ...base, fare: { ...base.fare, city } });
    await page.setViewportSize({ width: 1280, height: 800 });
    await openWith(page, `/es/shared/${longShareId}`);
    const aside = page.locator('[role="tablist"] + div');
    await page.mouse.wheel(0, 900);
    await expect(aside).toHaveCSS("opacity", "1");
    const name = aside.getByTitle(city).locator("span").first();
    await expect(name).toHaveText(city);
    const [nameBox, asideBox] = [await name.boundingBox(), await aside.boundingBox()];
    expect(nameBox.x).toBeGreaterThanOrEqual(asideBox.x);
    expect(await name.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  });

  test("saving it asks to sign in, and it is saved in the account on the way back", async ({ page }) => {
    const visitor = await createTestUser({ fullName: "Visitor" });
    try {
      await page.setViewportSize(DESKTOP);
      await openWith(page, `/es/shared/${shareId}`);
      await page.getByRole("button", { name: "Guardar en mis viajes" }).first().click();
      await page.waitForURL(/\/login/);
      expect(new URL(page.url()).searchParams.get("next")).toBe(`/es/shared/${shareId}?save=1`);
      expect(await savedTrips(page)).toEqual([]);
      // Back from signing in
      await signIn(page, visitor);
      await page.goto(`/es/shared/${shareId}?save=1`);
      await page.waitForURL(/\/es\/trips\?id=/);
      await expect.poll(async () => (await accountTrips(visitor)).map((row) => row.id)).toEqual([trip.id]);
    } finally {
      await deleteTestUser(visitor);
    }
  });

  test("the owner shares a trip from its page and turns the link off", async ({ page, browser }) => {
    const sharer = await createTestUser({ fullName: "Sharer" });
    try {
      const ownTrip = flightTrip({ id: "own-share-test" });
      await page.setViewportSize(DESKTOP);
      await openWith(page, "/es", { trips: [ownTrip] });
      await signIn(page, sharer);
      await page.goto(`/es/trips?id=${ownTrip.id}`);
      await page.getByRole("button", { name: "Compartir" }).click();
      const link = page.getByRole("textbox", { name: "Enlace para compartir" });
      await expect(link).toHaveValue(/\/es\/shared\/[\w-]{12}$/);
      const url = await link.inputValue();

      // Anyone with the link sees it
      const visitor = await browser.newPage();
      await visitor.goto(url);
      await expect(visitor.getByText("Sharer te comparte su viaje")).toBeVisible();

      await page.getByRole("button", { name: "Dejar de compartir" }).click();
      await expect(page.getByRole("dialog")).toBeHidden();
      await visitor.reload();
      await expect(visitor.getByText("Este enlace ya no está disponible")).toBeVisible();
      await visitor.close();
    } finally {
      await deleteTestUser(sharer);
    }
  });

  test("signed out, sharing asks to sign in first", async ({ page }) => {
    const ownTrip = flightTrip({ id: "signed-out-share-test" });
    await openWith(page, `/es/trips?id=${ownTrip.id}`, { trips: [ownTrip] });
    await page.getByRole("button", { name: "Compartir" }).click();
    await expect(page.getByRole("dialog")).toContainText("Entra para compartir");
  });
});
