// The route pages' data as the cron last wrote it (flight_route_snapshots, supabase/migrations): one row per airport
// we publish routes from. The pages only read it, so a visit (or a search engine's crawl) never asks the airlines.
// Each read is made once per page render (React's cache): its metadata and its body share it. A failed read throws,
// so a page being made again keeps its last good version. Only called from the server.
import { cache } from "react";
import { supabaseAdmin } from "@/supabase/admin";

const TABLE = "flight_route_snapshots";

const rowsOf = ({ data, error }) => {
  if (error) throw new Error(`Could not read the route pages: ${error.message}`);
  return data;
};

// Every airport's page: [{ origin, info: { es, en }, updated_at }]
export const readOrigins = cache(async () => rowsOf(await supabaseAdmin().from(TABLE).select("origin, info, updated_at")));

// One airport's routes and prices in `lang`: { routes, prices }, or null before the cron has written it
export const readOrigin = cache(async (origin, lang) => {
  const rows = rowsOf(await supabaseAdmin().from(TABLE).select(`routes:routes->${lang}, prices`).eq("origin", origin));
  return rows[0] ?? null;
});

// Every airport's routes in `lang`, without their prices (the sitemap): [{ origin, routes, updated_at }]
export const readAllRoutes = cache(async (lang) => rowsOf(await supabaseAdmin().from(TABLE).select(`origin, updated_at, routes:routes->${lang}`)));

// When each airport was last written: Map origin → time (ms)
export const snapshotTimes = async () => {
  const rows = rowsOf(await supabaseAdmin().from(TABLE).select("origin, updated_at"));
  return new Map(rows.map((row) => [row.origin, new Date(row.updated_at).getTime()]));
};

// Writes one airport's snapshot (server/flightRoutes/refresh), replacing the last one
export const saveSnapshot = async ({ origin, info, routes, prices }) => {
  const { error } = await supabaseAdmin()
    .from(TABLE)
    .upsert({ origin, info, routes, prices, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Could not save the routes of ${origin}: ${error.message}`);
};
