// The route graph as the cron last wrote it (route_graph, supabase/migrations): one row with every route. Only
// called from the server.
import { supabaseAdmin } from "@/supabase/admin";

const TABLE = "route_graph";

// { routes: { "MLA": { "FCO": ["ryanair", "wizz"] } }, counts: { ryanair, wizz }, updated_at }, or null before the
// cron has written it. A failed read throws.
export const readGraph = async () => {
  const { data, error } = await supabaseAdmin().from(TABLE).select("routes, counts, updated_at").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Could not read the route graph: ${error.message}`);
  return data;
};

// Writes the graph (server/routeGraph/build), replacing the last one
export const saveGraph = async ({ routes, counts }) => {
  const { error } = await supabaseAdmin().from(TABLE).upsert({ id: 1, routes, counts, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Could not save the route graph: ${error.message}`);
};
