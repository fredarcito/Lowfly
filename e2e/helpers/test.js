import { test as base, expect } from "@playwright/test";

// Errors the app cannot avoid in a test run (the dev server's own noise)
const IGNORED_ERRORS = [/Download the React DevTools/, /\[Fast Refresh\]/, /\[HMR\]/];

// `test` with every page watched: an uncaught error or a console error fails the test (after it ran, so the
// steps that led there show in the report)
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !IGNORED_ERRORS.some((pattern) => pattern.test(message.text()))) errors.push(message.text());
    });
    await use(page);
    expect(errors, "errors in the page").toEqual([]);
  },
});

export { expect };

// Phone and desktop sizes the app is designed for
export const PHONE = { width: 390, height: 844 };
export const TABLET = { width: 800, height: 900 };
export const DESKTOP = { width: 1280, height: 900 };

// Before the app loads: saved trips, theme and departure airport, as the browser keeps them (localStorage).
// Set on the first page of the origin, then the page is opened again with them.
export const openWith = async (page, path, { trips, theme, origin } = {}) => {
  await page.goto("/es");
  await page.evaluate(
    ({ savedTrips, chosenTheme, chosenOrigin }) => {
      if (savedTrips) localStorage.setItem("lowfly.trips", JSON.stringify(savedTrips));
      else localStorage.removeItem("lowfly.trips");
      if (chosenTheme) localStorage.setItem("lowfly.theme", chosenTheme);
      if (chosenOrigin) localStorage.setItem("lowfly.origin", chosenOrigin);
    },
    { savedTrips: trips, chosenTheme: theme, chosenOrigin: origin }
  );
  await page.goto(path);
};

// The trips saved in this browser
export const savedTrips = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("lowfly.trips") || "[]"));

// No sideways scroll: nothing wider than the screen
export const expectNoSidewaysScroll = async (page) => {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
};
