// Builds the route graph from the airlines and saves it (server/routeGraph/store). Only the cron calls it
// (app/api/cron/route-graph), once a week: one request to Ryanair and one to Wizz Air for every route they fly.
// Only called from the server.
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import { readGraph, saveGraph } from "@/server/routeGraph/store";

const SOURCES = { ryanair: ryanair.routes, wizz: wizz.routes };
// An airline answering with fewer routes than this share of the last graph's is taken as a bad answer
const MIN_SHARE = 0.5;

// Adds a route to the graph ({ from: { to: [airlines] } }), once per airline
const addRoute = (routes, from, to, airline) => {
  routes[from] ??= {};
  routes[from][to] ??= [];
  if (!routes[from][to].includes(airline)) routes[from][to].push(airline);
};

// An airline's routes in a graph: [[from, to]]
const routesOf = (graph, airline) =>
  Object.entries(graph?.routes ?? {}).flatMap(([from, destinations]) =>
    Object.entries(destinations)
      .filter(([, airlines]) => airlines.includes(airline))
      .map(([to]) => [from, to])
  );

// Builds and saves the graph: { counts: { ryanair, wizz }, kept: [airlines] }. An airline that fails, or answers
// with far fewer routes than last time, keeps its routes from the last graph (`kept`). When none answers, nothing is
// saved and it throws.
export const buildGraph = async () => {
  const previous = await readGraph();
  const airlines = Object.keys(SOURCES);
  const answers = await Promise.allSettled(airlines.map((airline) => SOURCES[airline]()));

  const routes = {};
  const counts = {};
  const kept = [];
  airlines.forEach((airline, index) => {
    const answer = answers[index];
    const lastCount = previous?.counts?.[airline] ?? 0;
    const fresh = answer.status === "fulfilled" && answer.value.length > 0 && answer.value.length >= lastCount * MIN_SHARE;
    if (!fresh) {
      kept.push(airline);
      console.error("Route graph: kept the last routes of", airline, answer.reason?.message ?? `${answer.value.length} routes`);
    }
    for (const [from, to] of fresh ? answer.value : routesOf(previous, airline)) addRoute(routes, from, to, airline);
  });
  for (const airline of airlines) counts[airline] = routesOf({ routes }, airline).length;

  if (kept.length === airlines.length) throw new Error("No airline returned its routes");
  await saveGraph({ routes, counts });
  return { counts, kept };
};
