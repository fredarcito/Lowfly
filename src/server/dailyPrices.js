// The cheapest price per day on a route, for every airline, and a pool to ask many routes a few at a time. Shared by
// the searches (server/flights) and the stopovers (server/stopovers). Only called from the server.
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
