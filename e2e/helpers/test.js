import { test as base, expect } from "@playwright/test";

// Errors the app cannot avoid in a test run (the dev server's own noise)
const IGNORED_ERRORS = [/Download the React DevTools/, /\[Fast Refresh\]/, /\[HMR\]/];

// What a "not found" page logs in the dev server: the 404 itself, and React's dev timing failing on a layout that
// ends in "not found" (a negative time stamp)
export const NOT_FOUND_ERRORS = /status of 404|Failed to execute 'measure' on 'Performance'/;

// `test` with every page watched: an uncaught error or a console error fails the test (after it ran, so the
// steps that led there show in the report). A test that expects some sets `test.use({ expectedErrors: /pattern/ })`.
export const test = base.extend({
  expectedErrors: [null, { option: true }],
  page: async ({ page, expectedErrors }, use) => {
    const errors = [];
    const ignored = expectedErrors ? [...IGNORED_ERRORS, expectedErrors] : IGNORED_ERRORS;
    page.on("pageerror", (error) => {
      if (!ignored.some((pattern) => pattern.test(error.message))) errors.push(error.message);
    });
    page.on("console", (message) => {
      if (message.type() === "error" && !ignored.some((pattern) => pattern.test(message.text()))) errors.push(message.text());
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
// Set on a light page of the same origin (robots.txt: not the app, which would start searching and fetching
// photos of its own), then the page is opened with them.
export const openWith = async (page, path, { trips, theme, origin } = {}) => {
  await page.goto("/robots.txt");
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
  const { scrollWidth, clientWidth, culprits } = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    // The innermost elements past the right edge: what to fix when it fails
    const outside = [...document.body.querySelectorAll("*")].filter((element) => element.getBoundingClientRect().right > width + 0.5);
    const innermost = outside.filter((element) => !outside.some((other) => other !== element && element.contains(other)));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: width,
      culprits: innermost.slice(0, 5).map((element) => `<${element.tagName.toLowerCase()} class="${element.className}"> ${element.textContent.trim().slice(0, 40)}`),
    };
  });
  expect(scrollWidth, `Wider than the screen because of:\n${culprits.join("\n")}`).toBeLessThanOrEqual(clientWidth);
};
