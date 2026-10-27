// The daily counters of server/metrics as the admin pages read them: one Redis hash a day, read together. Only called
// from the admin's server code.
import { redis } from "@/server/redis";
import { metricsKey } from "@/server/metrics";
import { SEARCH_MODES } from "@/constants/metrics";

const sum = (values) => values.reduce((total, value) => total + value, 0);

// One day's counts, by field (0 when missing)
const reader = (counts) => (field) => Number(counts?.[field] ?? 0);

// [{ day, counts, read(field) }] for `days` (oldest first); null without Redis (nothing is counted then)
export const readMetricDays = async (days) => {
  const store = redis();
  if (!store) return null;
  const batch = store.pipeline();
  for (const day of days) batch.hgetall(metricsKey(day));
  const answers = await batch.exec();
  return days.map((day, index) => ({ day, counts: answers[index], read: reader(answers[index]) }));
};

// The first of `metricDays` with any count (null if none): before it nothing was counted, so nothing to compare
export const firstCounted = (metricDays) => metricDays.find((day) => Object.keys(day.counts ?? {}).length)?.day ?? null;

// A day's searches in all and by kind: { day, value, everywhere, country, trip, multiCity }
export const searchesOfDay = (metricDay) => {
  const byMode = Object.fromEntries(SEARCH_MODES.map((mode) => [mode, metricDay.read(`search:${mode}`)]));
  return { day: metricDay.day, value: sum(Object.values(byMode)), ...byMode };
};
