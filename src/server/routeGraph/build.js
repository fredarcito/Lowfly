// Builds the route graph from the airlines and saves it (server/routeGraph/store). Only the cron calls it
// (app/api/cron/route-graph), once a week: one request to Ryanair and one to Wizz Air for every route they fly, and
// Travelpayouts' public route list for easyJet and Vueling (constants/airlines GRAPH_MORE_AIRLINES; their prices are
// not live, so they never join a same-day connection: server/stopovers/connection). Only called from the server.
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import * as more from "@/server/travelpayouts";
import { readGraph, saveGraph } from "@/server/routeGraph/store";
import { GRAPH_MORE_AIRLINES } from "@/constants/airlines";

// Where each airline's routes come from, for one graph: Ryanair's and Wizz Air's own lists, and Travelpayouts' one list
// shared by the more airlines (asked once)
const sourcesOf = () => {
  let moreRoutes = null;
  const moreOf = (airline) => async () => (await (moreRoutes ??= more.graphRoutes()))[airline];
  return { ryanair: ryanair.routes, wizz: wizz.routes, ...Object.fromEntries(GRAPH_MORE_AIRLINES.map((airline) => [airline, moreOf(airline)])) };
};
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

// Builds and saves the graph: { counts: { ryanair, wizz, easyjet, vueling }, kept: [airlines] }. An airline that
// fails, or answers with far fewer routes than last time, keeps its routes from the last graph (`kept`). When none
// answers, nothing is saved and it throws. `dryRun`: built and counted, not saved (to look before writing the graph
// every environment shares).
export const buildGraph = async ({ dryRun = false } = {}) => {
  const previous = await readGraph();
  const sources = sourcesOf();
  const airlines = Object.keys(sources);
  const answers = await Promise.allSettled(airlines.map((airline) => sources[airline]()));

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
  if (!dryRun) await saveGraph({ routes, counts });
  return { counts, kept, ...(dryRun && { routes }) };
};
