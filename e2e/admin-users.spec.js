import { DESKTOP, PHONE, expect, expectNoSidewaysScroll, test } from "./helpers/test.js";
import { accountUser, createTestUser, deleteRows, deleteTestUser, insertRows, readRows, saveTripAs, signIn, skipWithoutSupabase, updateRows } from "./helpers/accounts.js";
import { romeTrip } from "./helpers/trips.js";

// Managing accounts in the admin: the list with what each one cost, an account's page (its trips, deleting an
// itinerary, its own daily limit) and the app-wide limit
test.describe("admin: accounts", () => {
  skipWithoutSupabase();
  let admin;
  let person;
  const requestId = crypto.randomUUID();

  test.beforeEach(async ({ page }) => {
    admin = await createTestUser({ admin: true });
    person = await createTestUser({ fullName: "Persona Prueba" });
    await saveTripAs(person, romeTrip({ id: "admin-test-trip" }));
    // One itinerary to Rome made with Gemini: (1000 × 0.25 + 2000 × 1.5) / 1M = 0.00325 $
    await insertRows("itinerary_usage", [
      { request_id: requestId, user_id: person.id, trip_id: "admin-test-trip", kind: "flight", lang: "es", city: "Roma", country: "Italia", airport: "CIA", days: 4, provider: "gemini", model: "gemini-3.1-flash-lite", input_tokens: 1000, output_tokens: 2000, duration_ms: 1000 },
    ]);
    await page.goto("/es");
    await signIn(page, admin);
  });

  test.afterEach(async () => {
    // The usage stays when an account goes (it is the app's cost): this test's goes by hand
    await deleteRows("itinerary_usage", `request_id=eq.${requestId}`);
    await Promise.all([admin, person].filter(Boolean).map(deleteTestUser));
    // An account deleted from the admin keeps its saved trips' record, without the account: this test's goes too
    await deleteRows("trip_history", "user_id=is.null&trip_id=like.admin-test-trip*");
  });

  for (const viewport of [DESKTOP, PHONE]) {
    test(`the list finds an account with what it cost (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/es/admin");
      await page.getByRole("link", { name: "Usuarios" }).click();
      await page.getByRole("searchbox", { name: "Buscar usuarios" }).fill(person.email);
      await page.keyboard.press("Enter");
      const row = page.getByRole("link", { name: /Persona Prueba/ });
      await expect(row).toBeVisible();
      await expect(row).toContainText("0,0033");
      await expectNoSidewaysScroll(page);
      await row.click();
      await expect(page.getByRole("heading", { level: 1, name: "Persona Prueba" })).toBeVisible();
      await expect(page.getByText("Roma, Italia").first()).toBeVisible();
      await page.getByRole("tab", { name: /Consumo de IA/ }).click();
      await expect(page.getByRole("cell", { name: "gemini-3.1-flash-lite" })).toBeVisible();
      await expectNoSidewaysScroll(page);
    });
  }

  test("trips saved count the deleted ones too: saved over time, and how many are kept now", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await saveTripAs(person, romeTrip({ id: "admin-test-trip-2" }));
    await deleteRows("trips", `user_id=eq.${person.id}&id=eq.admin-test-trip-2`);
    await page.goto(`/es/admin/users?q=${encodeURIComponent(person.email)}`);
    const row = page.getByRole("link", { name: /Persona Prueba/ });
    // Active now and all time, side by side: 1 and 2 trips; 1 itinerary active (its trip has one) and 1 made
    const figure = (label) => row.locator("div").filter({ has: page.getByText(label, { exact: true }) }).locator("dd");
    await expect(figure("Viajes activos")).toHaveText("1");
    await expect(figure("Viajes en total")).toHaveText("2");
    await expect(figure("Itinerarios activos")).toHaveText("1");
    await expect(figure("Itinerarios en total")).toHaveText("1");
    await row.click();
    await expect(page.getByText("1 ahora · 0 compartidos")).toBeVisible();
    // The history: both trips saved (one deleted later) and the itinerary made, each with its date
    await page.getByRole("tab", { name: "Historial" }).click();
    const history = page.getByRole("tabpanel");
    await expect(history.getByText("Guardó un vuelo a Roma")).toHaveCount(2);
    await expect(history.getByText("Borrado después")).toHaveCount(1);
    await expect(history.getByText("Creó un itinerario de 4 días en Roma")).toBeVisible();
    await expect(history.getByText(/0,0033/)).toBeVisible();
  });

  test("the list filters, sorts (by the menu or a column's name) and keeps both in the address", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/es/admin/users");
    // Each account is a link to its page
    const rows = page.getByRole("link").filter({ hasText: "@example.com" });
    // Only admins: the test's admin, not the person
    await page.getByRole("combobox", { name: "Filtrar cuentas" }).selectOption("admins");
    await expect(page).toHaveURL(/filter=admins/);
    await expect(rows.filter({ hasText: admin.email })).toHaveCount(1);
    await expect(rows.filter({ hasText: person.email })).toHaveCount(0);
    // All accounts, the most AI cost first: the figures go down
    await page.getByRole("combobox", { name: "Filtrar cuentas" }).selectOption("all");
    await expect(page).not.toHaveURL(/filter=/);
    await page.getByRole("combobox", { name: "Ordenar por" }).selectOption("cost");
    await expect(page).toHaveURL(/sort=cost/);
    const costs = await page.locator("dd").filter({ hasText: /US\$/ }).allTextContents();
    const amounts = costs.map((cost) => Number(cost.replace(/[^\d,]/g, "").replace(",", ".")));
    expect(amounts).toEqual(amounts.toSorted((first, second) => second - first));
    // A column's name sorts by it, and again the other way
    await page.getByRole("link", { name: /Ordenar por viajes en total/ }).click();
    await expect(page).toHaveURL(/sort=tripsTotal/);
    await page.getByRole("link", { name: /Ordenar por viajes en total \(de menos a más\)/ }).click();
    await expect(page).toHaveURL(/sort=tripsTotal&dir=asc/);
    // A search keeps the order
    await page.getByRole("searchbox", { name: "Buscar usuarios" }).fill(person.email);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/sort=tripsTotal/);
    await expect(rows).toHaveCount(1);
  });

  test("deleting a trip's itinerary keeps the trip", async ({ page }) => {
    await page.goto(`/es/admin/users/${person.id}`);
    await expect(page.getByText("Itinerario de 4 días")).toBeVisible();
    // What it cost to make: tokens in + out and dollars
    const tripItem = page.locator("li").filter({ hasText: "Itinerario de 4 días" });
    await expect(tripItem).toContainText("1000 + 2000 tokens");
    await expect(tripItem).toContainText("0,0033");
    await page.getByRole("button", { name: "Borrar itinerario" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Borrar itinerario" }).click();
    await expect(page.getByText("Sin itinerario")).toBeVisible();
    const [trip] = await readRows("trips", `user_id=eq.${person.id}&select=data`);
    expect(trip.data.itinerary).toBeNull();
    expect(trip.data.fare.city).toBe("Roma");
  });

  test("an account's own daily limit, and back to the app-wide one", async ({ page }) => {
    await page.goto(`/es/admin/users/${person.id}`);
    await page.getByRole("tab", { name: /Límite/ }).click();
    const limits = page.getByRole("tabpanel");
    await limits.getByRole("radio", { name: "Uno propio" }).check();
    await limits.getByRole("spinbutton", { name: "Itinerarios al día" }).fill("2");
    await limits.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(limits.getByRole("button", { name: "Guardado" })).toBeVisible();
    expect(await readRows("user_limits", `user_id=eq.${person.id}&select=itineraries_per_day`)).toEqual([{ itineraries_per_day: 2 }]);

    await limits.getByRole("radio", { name: /El general/ }).check();
    await limits.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(limits.getByRole("button", { name: "Guardado" })).toBeVisible();
    expect(await readRows("user_limits", `user_id=eq.${person.id}`)).toEqual([]);
  });

  test("editing an account: name, email, admin and blocked", async ({ page }) => {
    await page.goto(`/es/admin/users/${person.id}`);
    await page.getByRole("tab", { name: /Cuenta/ }).click();
    const account = page.getByRole("tabpanel");
    const newEmail = person.email.replace("@", "-new@");
    await account.getByLabel("Nombre").fill("Nombre Nuevo");
    await account.getByLabel("Email").fill(newEmail);
    await account.getByRole("checkbox", { name: /Administrador/ }).check();
    await account.getByRole("checkbox", { name: /Acceso bloqueado/ }).check();
    await account.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(account.getByRole("button", { name: "Guardado" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nombre Nuevo");
    await expect(page.getByText("Bloqueado", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: /Cuenta/ }).click();
    const saved = await accountUser(person);
    expect(saved.email).toBe(newEmail);
    expect(saved.user_metadata.full_name).toBe("Nombre Nuevo");
    expect(saved.app_metadata.role).toBe("admin");
    expect(new Date(saved.banned_until) > new Date()).toBe(true);

    // Unblocked and no longer an admin
    await account.getByRole("checkbox", { name: /Administrador/ }).uncheck();
    await account.getByRole("checkbox", { name: /Acceso bloqueado/ }).uncheck();
    await account.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(account.getByRole("button", { name: "Guardado" })).toBeVisible();
    const unblocked = await accountUser(person);
    expect(unblocked.app_metadata.role ?? null).toBeNull();
    expect(!unblocked.banned_until || new Date(unblocked.banned_until) <= new Date()).toBe(true);
  });

  test("deleting an account, then back to the list", async ({ page }) => {
    await page.goto(`/es/admin/users/${person.id}`);
    await page.getByRole("tab", { name: /Cuenta/ }).click();
    await page.getByRole("button", { name: "Eliminar cuenta", exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Eliminar cuenta" }).click();
    await page.waitForURL(/\/es\/admin\/users$/);
    expect((await accountUser(person)).id).toBeUndefined();
    expect(await readRows("trips", `user_id=eq.${person.id}`)).toEqual([]);
    person = null;
  });

  test("their own account: no blocking, giving up the admin or deleting", async ({ page }) => {
    await page.goto(`/es/admin/users/${admin.id}`);
    await page.getByRole("tab", { name: /Cuenta/ }).click();
    const account = page.getByRole("tabpanel");
    await expect(account.getByRole("checkbox", { name: /Administrador/ })).toBeDisabled();
    await expect(account.getByRole("checkbox", { name: /Acceso bloqueado/ })).toBeDisabled();
    await page.getByRole("tab", { name: /Cuenta/ }).click();
    await expect(page.getByRole("button", { name: "Eliminar cuenta", exact: true })).toBeDisabled();
  });

  test("the app-wide daily limit", async ({ page }) => {
    const [{ value: before }] = await readRows("app_settings", "key=eq.itineraries_per_day&select=value");
    try {
      await page.goto("/es/admin/settings");
      const field = page.getByRole("spinbutton", { name: "Itinerarios al día" });
      await expect(field).toHaveValue(String(before));
      await field.fill(String(before + 3));
      await page.getByRole("button", { name: "Guardar" }).click();
      await expect(page.getByRole("button", { name: "Guardado" })).toBeVisible();
      expect(await readRows("app_settings", "key=eq.itineraries_per_day&select=value")).toEqual([{ value: before + 3 }]);
    } finally {
      // It is the real setting: back as it was
      await updateRows("app_settings", "key=eq.itineraries_per_day", { value: before });
    }
  });
});
