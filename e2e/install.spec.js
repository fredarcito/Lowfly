import { DESKTOP, PHONE, expect, openWith, test } from "./helpers/test.js";

const IPHONE_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";

// The banner waits this long on the home before it shows (InstallBanner's BANNER_DELAY)
const BANNER_DELAY = 20_000;

// Installing Lowfly on the home screen: a banner on the home on phones once the visitor has been there a while (the
// browser's dialog on Android, the steps on iPhone), closed for good with "No, thanks", and the same action in the
// settings menu
test.describe("install the app", () => {
  test.describe("iPhone", () => {
    test.use({ userAgent: IPHONE_AGENT });

    test("the banner shows the steps and, once closed, does not come back", async ({ page }) => {
      await page.setViewportSize(PHONE);
      await page.clock.install();
      await openWith(page, "/es");
      const banner = page.getByRole("complementary", { name: "Instalar Lowfly" });
      // Not as the page opens: only after a while
      await page.locator("#origin").waitFor();
      await page.clock.fastForward(BANNER_DELAY / 2);
      await expect(banner).toHaveCount(0);
      await page.clock.fastForward(BANNER_DELAY / 2);
      await expect(banner).toBeVisible();
      await banner.getByRole("button", { name: "Instalar app" }).click();
      const steps = page.getByRole("dialog");
      await expect(steps).toContainText("Añadir a pantalla de inicio");
      await steps.getByRole("button", { name: "Cerrar" }).click();

      await banner.getByRole("button", { name: "No, gracias" }).click();
      await expect(banner).toBeHidden();
      await page.reload();
      await page.locator("#origin").waitFor();
      await page.clock.fastForward(BANNER_DELAY);
      await expect(banner).toBeHidden();

      // Still in the settings menu
      await page.getByRole("button", { name: "Ajustes" }).click();
      await page.getByRole("menuitem", { name: "Instalar la app" }).click();
      await expect(page.getByRole("dialog")).toContainText("Añadir a pantalla de inicio");
    });

    test("only on the home, and only on phones", async ({ page }) => {
      await page.setViewportSize(PHONE);
      await page.clock.install();
      await openWith(page, "/es/guias");
      await expect(page.getByRole("button", { name: "Ajustes" })).toBeVisible();
      await page.clock.fastForward(BANNER_DELAY);
      await expect(page.getByRole("complementary", { name: "Instalar Lowfly" })).toHaveCount(0);
      await page.setViewportSize(DESKTOP);
      await openWith(page, "/es");
      await page.locator("#origin").waitFor();
      await page.clock.fastForward(BANNER_DELAY);
      await expect(page.getByRole("complementary", { name: "Instalar Lowfly" })).toBeHidden();
    });
  });

  test("Android: the banner opens the browser's own dialog", async ({ page }) => {
    await page.setViewportSize(PHONE);
    // A fake clock, so the test does not wait for the banner's delay
    await page.clock.install();
    await openWith(page, "/en");
    await page.locator("#origin").waitFor();
    await page.clock.fastForward(BANNER_DELAY);
    const banner = page.getByRole("complementary", { name: "Install Lowfly" });
    // A desktop browser that cannot install: no banner
    await expect(banner).toHaveCount(0);
    // Chrome offering to install, with a stand-in for its dialog
    await page.evaluate(() => {
      const offer = new Event("beforeinstallprompt");
      offer.prompt = async () => {
        window.installPrompted = true;
      };
      window.dispatchEvent(offer);
    });
    await banner.getByRole("button", { name: "Install app" }).click();
    await expect.poll(() => page.evaluate(() => window.installPrompted)).toBe(true);
    // The offer works once: the banner leaves with it
    await expect(banner).toHaveCount(0);
  });
});
