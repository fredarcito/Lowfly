import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ROUTE_ORIGINS } from "@/server/flightRoutes/routes";
import { refreshOrigin } from "@/server/flightRoutes/refresh";
import { snapshotTimes } from "@/server/flightRoutes/snapshots";
import { isCronRequest } from "@/server/cron";
import { announcePages } from "@/server/indexNow";
import { changedContent } from "@/server/contentChanges";
import { ROUTES } from "@/constants/routes";
import { LOCALES } from "@/i18n/config";

// GET /api/cron/flight-routes → writes again the route pages' data (server/flightRoutes/refresh), the oldest airports
// first, one at a time so the airlines see a few requests at once (every airport in well under a minute). Vercel
// Cron calls it (vercel.json) with CRON_SECRET as a bearer token. On the Hobby plan a cron runs once a day, so there
// are three an hour apart: the later ones only write what is still old (an airport kept because an airline did not
// answer, or one left when a run's time was up).
// The airports written are told to IndexNow (server/indexNow): their page (its prices changed) and their new routes,
// in every language. The other route pages wait for the sitemap's lastmod: announcing all of them every night would
// teach the search engines to ignore us. With them, the city guides and multi-city routes new or changed since the
// last deploy (server/contentChanges), remembered once IndexNow has them.
// ?origin=MLA: only that airport, however fresh (by hand, and the tests).
export const maxDuration = 300;

// An airport written this long ago is written again
const STALE_MS = 20 * 3600 * 1000;
// No airport is started after this long (one takes a second or two; the function may run 300 s)
const BUDGET_MS = 240_000;

export const GET = async (request) => {
  if (!isCronRequest(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const started = Date.now();
  const only = request.nextUrl.searchParams.get("origin")?.toUpperCase();
  if (only && !ROUTE_ORIGINS.includes(only)) return NextResponse.json({ error: "unknownOrigin" }, { status: 400 });

  const writtenAt = await snapshotTimes();
  // Never written first, then the oldest
  const age = (origin) => writtenAt.get(origin) ?? 0;
  const queue = only
    ? [only]
    : ROUTE_ORIGINS.filter((origin) => started - age(origin) > STALE_MS).sort((first, second) => age(first) - age(second));

  const done = [];
  const errors = [];
  for (const origin of queue) {
    if (Date.now() - started > BUDGET_MS) break;
    try {
      done.push(await refreshOrigin(origin, { saved: writtenAt.has(origin) }));
    } catch (error) {
      console.error("Route pages of", origin, error.message);
      errors.push({ origin, error: error.message });
    }
  }

  // The pages are made again on their next visit, from what was just saved
  if (done.some((result) => !result.kept)) {
    revalidatePath("/[lang]/flights", "page");
    revalidatePath("/[lang]/flights/[route]", "page");
    revalidatePath("/sitemap.xml");
  }
  // The pages that changed: every airport written, with its new routes, in every language
  const changed = done
    .filter((result) => !result.kept)
    .flatMap((result) => [result.slug, ...result.added])
    .flatMap((slug) => LOCALES.map((lang) => ROUTES.flightRoute(lang, slug)));
  const content = await changedContent();
  const indexNow = await announcePages([...changed, ...content.paths]);
  if (indexNow.sent) await content.save();

  const handled = new Set([...done.map((result) => result.origin), ...errors.map((result) => result.origin)]);
  return NextResponse.json(
    { done, errors, indexNow, left: queue.filter((origin) => !handled.has(origin)), seconds: Math.round((Date.now() - started) / 1000) },
    { headers: { "cache-control": "no-store" } }
  );
};
