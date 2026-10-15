import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// The app's keys (Supabase, for the tests that sign in or share) from .env.local, as `next dev` reads them
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3001";

// Browser tests (e2e/). `pnpm test:e2e` runs them all against the dev server (started if it is not running;
// one already on that port is reused). Tests tagged @live search real flights at Ryanair and Wizz: slower and
// they depend on the airlines answering; `pnpm test:e2e:quick` leaves them out.
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // The dev server compiles pages on first visit and the live searches are heavy: a few at a time
  workers: 3,
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e/report" }]],
  outputDir: "e2e/results",
  use: {
    baseURL: BASE_URL,
    locale: "es-ES",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --port 3001",
    url: `${BASE_URL}/es`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
