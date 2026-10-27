// The daily counters of server/metrics as the admin pages read them: one Redis hash a day. Upstash bills each command,
// so the overview and "Uso" share what they read and read little: nothing before the first day counted, the days
// before today once a day (they never change again: kept in Next's cache), and only today on every visit. Only
// called from the admin's server code.
import { unstable_cache } from "next/cache";
import { redis } from "@/server/redis";
import { metricsKey } from "@/server/metrics";
import { SEARCH_MODES } from "@/constants/metrics";

// The first day with counters: before it there is nothing to read
const COUNTED_SINCE = "2026-10-20";

const sum = (values) => values.reduce((total, value) => total + value, 0);

// One day's counts, by field (0 when missing)
const reader = (counts) => (field) => Number(counts?.[field] ?? 0);

// `days`' counts (null for a day with none), one command each, sent together
const readCounts = async (days) => {
  const batch = redis().pipeline();
  for (const day of days) batch.hgetall(metricsKey(day));
  return batch.exec();
};

// The days before today: read again only when the list changes (a new day) or after a day
const readPastCounts = unstable_cache(readCounts, ["admin-metric-days"], { revalidate: 86_400 });

// [{ day, counts, read(field) }] for `days` (oldest first); null without Redis (nothing is counted then)
export const readMetricDays = async (days) => {
  if (!redis()) return null;
  const today = new Date().toISOString().slice(0, 10);
  const past = days.filter((day) => day >= COUNTED_SINCE && day < today);
  const [pastCounts, [todayCounts]] = await Promise.all([
    past.length ? readPastCounts(past) : [],
    days.includes(today) ? readCounts([today]) : [null],
  ]);
  const countsOf = new Map(past.map((day, index) => [day, pastCounts[index]]));
  countsOf.set(today, todayCounts);
  return days.map((day) => {
    const counts = countsOf.get(day) ?? null;
    return { day, counts, read: reader(counts) };
  });
};

// The first of `metricDays` with any count (null if none): before it nothing was counted, so nothing to compare
export const firstCounted = (metricDays) => metricDays.find((day) => Object.keys(day.counts ?? {}).length)?.day ?? null;

// A day's searches in all and by kind: { day, value, everywhere, country, trip, multiCity }
export const searchesOfDay = (metricDay) => {
  const byMode = Object.fromEntries(SEARCH_MODES.map((mode) => [mode, metricDay.read(`search:${mode}`)]));
  return { day: metricDay.day, value: sum(Object.values(byMode)), ...byMode };
};
