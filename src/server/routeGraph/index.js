// Where Ryanair and Wizz Air fly, read from the route graph (docs/stopovers.md) instead of asking the airlines.
// The graph changes once a week, so each server instance keeps it in memory for an hour. Without it (the cron has
// not written it yet, or Supabase fails), the callers ask the airlines as before. Only called from the server.
import { readGraph } from "@/server/routeGraph/store";

const KEEP_MS = 3600 * 1000;
// After a failed read, how long until the next try (each search would otherwise wait for one)
const RETRY_MS = 5 * 60 * 1000;

let memory = { routes: null, until: 0, reading: null };

// Every route ({ "MLA": { "FCO": ["ryanair", "wizz"] } }), or null without a graph
export const getGraph = async () => {
  if (Date.now() < memory.until) return memory.routes;
  memory.reading ??= readGraph()
    .then((graph) => {
      memory = { routes: graph?.routes ?? null, until: Date.now() + (graph ? KEEP_MS : RETRY_MS), reading: null };
    })
    .catch((error) => {
      console.error(error.message);
      memory = { routes: null, until: Date.now() + RETRY_MS, reading: null };
    });
  await memory.reading;
  return memory.routes;
};

// The airports Ryanair and Wizz fly to from `origin`: { "FCO": ["ryanair", "wizz"], … }, or null when the graph is
// missing or does not know `origin`
export const routesFrom = async (origin) => (await getGraph())?.[origin] ?? null;
