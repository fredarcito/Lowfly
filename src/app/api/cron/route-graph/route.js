import { NextResponse } from "next/server";
import { buildGraph } from "@/server/routeGraph/build";
import { isCronRequest } from "@/server/cron";

// GET /api/cron/route-graph → writes again the route graph (server/routeGraph/build): every route Ryanair and Wizz Air
// fly, in two requests, and easyJet's and Vueling's from Travelpayouts' route list. Vercel Cron calls it (vercel.json)
// on Mondays at 02:00 UTC: after the airlines' season change (the last Sunday of March and October), and before the
// route pages' crons, which ask Ryanair too. `?dryRun=1`: built and counted, not saved (every environment shares it).
export const maxDuration = 60;

export const GET = async (request) => {
  if (!isCronRequest(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
    const { counts, kept } = await buildGraph({ dryRun });
    return NextResponse.json({ counts, kept, ...(dryRun && { dryRun }) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Route graph", error.message);
    return NextResponse.json({ error: error.message }, { status: 502, headers: { "cache-control": "no-store" } });
  }
};
