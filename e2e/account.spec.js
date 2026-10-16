import { PHONE, expect, expectNoSidewaysScroll, openWith, savedTrips, test } from "./helpers/test.js";
import { accountTrips, accountUser, createTestUser, deleteTestUser, signIn, skipWithoutSupabase } from "./helpers/accounts.js";
import { flightTrip } from "./helpers/trips.js";

// Accounts: the sign-in page, and the trips kept in the account (the same on every device)
test.describe("account", () => {
  for (const viewport of [{ width: 1280, height: 800 }, PHONE, { width: 340, height: 700 }]) {
    test(`the sign-in page fits (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/es/login?next=%2Fes%2Ftrips");
      await expect(page.getByRole("button", { name: /Continuar con Google/ })).toBeVisible();
      await expectNoSidewaysScroll(page);
    });
  }

  test.describe("signed in", () => {
    skipWithoutSupabase();
    let user;
    test.beforeEach(async () => {
      user = await createTestUser();
    });
    test.afterEach(async () => {
      if (user) await deleteTestUser(user);
    });

    test("the account keeps the page's language, so Supabase's emails come in it", async ({ page }) => {
      await page.goto("/en");
      await signIn(page, user);
      await page.reload();
      await expect.poll(async () => (await accountUser(user)).user_metadata?.locale).toBe("en");

      await page.goto("/es");
      await expect.poll(async () => (await accountUser(user)).user_metadata?.locale).toBe("es");
    });

    test("trips saved before signing in go to the account, and changes follow on every device", async ({ page, browser }) => {
      const header = page.locator("header");
      const trip = flightTrip({ id: "guest-trip", inDays: 30 });
      await openWith(page, "/es/trips", { trips: [trip] });
      await expect(header.getByRole("link", { name: /Entrar/ })).toBeVisible();
      // Signed out with trips: they are only in this browser, and the page says so
      await expect(page.getByText("Guardados en este navegador").filter({ visible: true })).toBeVisible();

      await signIn(page, user);
      await page.reload();
      await expect(header.getByRole("button", { name: /Tu cuenta/ })).toBeVisible();
      await expect(page.getByText("Guardados en este navegador")).toHaveCount(0);
      await expect.poll(async () => (await accountTrips(user)).map((row) => row.id)).toEqual(["guest-trip"]);

      // Marked as booked here: the account has it too
      await page.getByRole("button", { name: /Más opciones/ }).first().click();
      await page.getByRole("menuitem", { name: /Marcar como reservado/ }).click();
      await expect.poll(async () => (await accountTrips(user))[0]?.data.booked).toBe(true);

      // Another device signs in and finds it
      const otherDevice = await browser.newPage({ viewport: PHONE });
      await otherDevice.goto("/es");
      await signIn(otherDevice, user);
      await otherDevice.goto("/es/trips");
      await expect(otherDevice.locator("article").first()).toContainText("Catania");
      await expect(otherDevice.locator("article").first()).toContainText("Reservado");
      await otherDevice.close();

      // Deleted here: gone from the account
      await page.getByRole("button", { name: /Más opciones/ }).first().click();
      await page.getByRole("menuitem", { name: /Eliminar viaje/ }).click();
      await page.getByRole("button", { name: /Eliminar/ }).last().click();
      await expect.poll(async () => (await accountTrips(user)).length).toBe(0);

      // Signing out: this browser forgets the account's trips
      await header.getByRole("button", { name: /Tu cuenta/ }).click();
      await page.getByRole("menuitem", { name: /Cerrar sesión/ }).click();
      await expect(header.getByRole("link", { name: /Entrar/ })).toBeVisible();
      expect(await savedTrips(page)).toEqual([]);
    });
  });
});
