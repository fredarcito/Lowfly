// The cheapest price per day on a route, for every airline, and a pool to ask many routes a few at a time. Shared by
// the searches (server/flights), the stopovers (server/stopovers) and the multi-city routes (server/multiCity). Only
// called from the server.
import * as ryanair from "@/server/ryanair";
import * as wizz from "@/server/wizz";
import * as more from "@/server/travelpayouts";
import { MORE_AIRLINES } from "@/constants/airlines";

// (dep, arr, from, to) → [{ day, time, times?, arrive?, price, cur, airline?, cached? }] per airline
export const DAILY = {
  ryanair: ryanair.daily,
  wizz: wizz.daily,
  ...Object.fromEntries(Object.keys(MORE_AIRLINES).map((airline) => [airline, (dep, arr, from, to) => more.daily(dep, arr, from, to, airline)])),
};
// The airlines whose failure is worth telling (the others are a bonus)
export const LIVE = ["ryanair", "wizz"];

// Runs jobs ({ airline, run }) at most `concurrency` at a time and records which airline fails
export const pool = async (jobs, failed, concurrency = 6) => {
  // Only the live airlines' failures are told; the others just add nothing
  const res = [];
  let nextJob = 0;
  const worker = async () => {
    while (nextJob < jobs.length) {
      const jobIndex = nextJob++;
      try {
        res[jobIndex] = await jobs[jobIndex].run();
      } catch {
        res[jobIndex] = null;
        if (LIVE.includes(jobs[jobIndex].airline)) failed.add(jobs[jobIndex].airline);
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return res;
};

// The flights per day of every route asked ([{ dep, arr, airlines, from, to }]: stopovers, multi-city routes), each
// route and airline once over the widest dates asked: Map "dep|arr" → [fares with from, to and airline]
export const routeFares = async (requests, failed) => {
  const byRoute = new Map();
  for (const request of requests)
    for (const airline of request.airlines) {
      const key = `${request.dep}|${request.arr}|${airline}`;
      const known = byRoute.get(key);
      if (!known) byRoute.set(key, { ...request, airline });
      else byRoute.set(key, { ...known, from: request.from < known.from ? request.from : known.from, to: request.to > known.to ? request.to : known.to });
    }
  const jobs = [...byRoute.values()]
    .filter((route) => DAILY[route.airline] && route.from <= route.to)
    .map((route) => ({
      airline: route.airline,
      run: async () =>
        (await DAILY[route.airline](route.dep, route.arr, route.from, route.to)).map((fare) => ({
          ...fare,
          airline: fare.airline ?? route.airline,
          from: route.dep,
          to: route.arr,
        })),
    }));
  // Few at a time, so Wizz does not block us
  const answers = await pool(jobs, failed, 3);
  const fares = new Map();
  for (const fare of answers.filter(Boolean).flat()) {
    const key = `${fare.from}|${fare.to}`;
    if (!fares.has(key)) fares.set(key, []);
    fares.get(key).push(fare);
  }
  return fares;
};

// The flights of a leg (several routes) between two days
export const legOf = (fares, routes, from, to) =>
  routes.flatMap((route) => fares.get(`${route.dep}|${route.arr}`) ?? []).filter((fare) => fare.day >= from && fare.day <= to);
