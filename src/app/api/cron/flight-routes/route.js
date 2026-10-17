import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ROUTE_ORIGINS } from "@/server/flightRoutes/routes";
import { refreshOrigin } from "@/server/flightRoutes/refresh";
import { snapshotTimes } from "@/server/flightRoutes/snapshots";

// GET /api/cron/flight-routes → writes again the route pages' data (server/flightRoutes/refresh), the oldest airports
// first, one at a time so the airlines see a few requests at once (every airport in well under a minute). Vercel
// Cron calls it (vercel.json) with CRON_SECRET as a bearer token. On the Hobby plan a cron runs once a day, so there
// are three an hour apart: the later ones only write what is still old (an airport kept because an airline did not
// answer, or one left when a run's time was up).
// ?origin=MLA: only that airport, however fresh (by hand, and the tests).
export const maxDuration = 300;

// An airport written this long ago is written again
const STALE_MS = 20 * 3600 * 1000;
// No airport is started after this long (one takes a second or two; the function may run 300 s)
const BUDGET_MS = 240_000;

const authorized = (request) => Boolean(process.env.CRON_SECRET) && request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

export const GET = async (request) => {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
  const handled = new Set([...done.map((result) => result.origin), ...errors.map((result) => result.origin)]);
  return NextResponse.json(
    { done, errors, left: queue.filter((origin) => !handled.has(origin)), seconds: Math.round((Date.now() - started) / 1000) },
    { headers: { "cache-control": "no-store" } }
  );
};
