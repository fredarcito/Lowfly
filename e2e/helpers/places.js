import { readFileSync } from "node:fs";
import { join } from "node:path";

// Town search answers recorded from /api/places (Open-Meteo behind it): the form's tests do not depend on that
// service being up. Searches not recorded find nothing.
const RECORDED = JSON.parse(readFileSync(join(process.cwd(), "e2e/fixtures/places.json"), "utf8"));

export const serveRecordedPlaces = (page) =>
  page.route("**/api/places?*", (route) => {
    const query = new URL(route.request().url()).searchParams.get("q")?.toLowerCase() ?? "";
    return route.fulfill({ json: RECORDED[query] ?? { places: [] } });
  });
