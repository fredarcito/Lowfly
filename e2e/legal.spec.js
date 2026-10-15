import { expect, test } from "./helpers/test.js";

// The terms of use and the privacy policy: in both languages, linked from each other, the sign-in page and home
test.describe("legal pages", () => {
  const pages = [
    { path: "/es/terms", title: "Condiciones de uso", related: "/es/privacy" },
    { path: "/en/terms", title: "Terms of use", related: "/en/privacy" },
    { path: "/es/privacy", title: "Política de privacidad", related: "/es/terms" },
  ];

  for (const { path, title, related } of pages) {
    test(`${path} has its sections and links to the other page`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveText(title);
      expect(await page.locator("article h2").count()).toBeGreaterThan(2);
      await expect(page.locator("article a").last()).toHaveAttribute("href", related);
    });
  }

  test("the sign-in page and home link to them", async ({ page }) => {
    await page.goto("/es/login");
    await expect(page.getByRole("link", { name: "Condiciones de uso" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Política de privacidad" })).toBeVisible();
    await page.goto("/es");
    await expect(page.getByRole("link", { name: /Política de privacidad|Condiciones de uso/ })).toHaveCount(2);
  });

  // Google shows a site's icon in its results only as .ico or .png (not SVG)
  test("the favicon exists as .ico and .png", async ({ request }) => {
    expect((await request.get("/favicon.ico")).headers()["content-type"]).toBe("image/x-icon");
    expect((await request.get("/icon1.png")).headers()["content-type"]).toBe("image/png");
  });
});
