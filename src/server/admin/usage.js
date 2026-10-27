// The admin's "Uso" page: which kinds of search people use and how they end, and how the airlines answer, for the last
// days (server/metrics counts them, one Redis hash a day). Read with the admin's rights (only the admin page calls it,
// after checking the visitor is an admin).
import { KEEP_DAYS } from "@/server/metrics";
import { OUTCOMES } from "@/server/airlineGuard";
import { daysOf } from "@/server/admin/stats";
import { firstCounted, readMetricDays } from "@/server/admin/metricDays";
import { SEARCH_MODES } from "@/constants/metrics";

// The periods the page offers, in days
export const USAGE_PERIODS = ["7", "30", "90"];
export const DEFAULT_USAGE_PERIOD = "7";
// Travelpayouts: easyJet, Vueling and the other more airlines' recent prices (only asked, blocked or failed: Next keeps
// its answers, not the airline guard)
const AIRLINES = ["ryanair", "wizz", "travelpayouts"];

const sum = (values) => values.reduce((total, value) => total + value, 0);

// A kind of search over the days: how many, how they ended, the errors by code, and searches with dates of their own
const searchesOf = (mode, days) => {
  const fails = {};
  for (const day of days)
    for (const [field, count] of Object.entries(day.counts ?? {})) {
      const code = field.startsWith(`search:${mode}:fail:`) && field.slice(`search:${mode}:fail:`.length);
      if (code) fails[code] = (fails[code] ?? 0) + Number(count);
    }
  const total = (suffix) => sum(days.map((day) => day.read(`search:${mode}${suffix}`)));
  return { mode, total: total(""), results: total(":results"), empty: total(":empty"), failed: sum(Object.values(fails)), fails, customDates: total(":custom") };
};

// An airline over the days: each outcome of its requests (OUTCOMES), and what follows from them
const airlineOf = (airline, days) => {
  const outcomes = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, sum(days.map((day) => day.read(`airline:${airline}:${outcome}`)))]));
  // Sent to the airline: answered, refused as too many, or failed
  const sent = outcomes.asked + outcomes.blocked + outcomes.error;
  const needed = outcomes.cached + sent + outcomes.paused + outcomes.busy;
  return {
    airline,
    ...outcomes,
    sent,
    needed,
    // Of the answers needed, the share that never reached the airline
    cacheShare: needed ? outcomes.cached / needed : 0,
    // Of the requests sent, the share the airline refused or failed
    failShare: sent ? (outcomes.blocked + outcomes.error) / sent : 0,
  };
};

// { available, period, days, searches: [per kind, most used first], airlines: [...], trend } — `available` false
// without Redis (nothing is counted then). The trend, apart from the period: every day kept (KEEP_DAYS), for the
// chart that zooms by week, month or year: { since (the first day with counts), sent, problems, unanswered } of
// [{ day, value }]; `unanswered`: the day's searches (`value`), how many found nothing (`empty`) and how many ended in
// an error (`failed`).
// The searches' trend is the overview's (server/admin/stats).
export const getUsageStats = async (period = DEFAULT_USAGE_PERIOD) => {
  const count = Number(period);
  const allDays = await readMetricDays(daysOf(KEEP_DAYS));
  if (!allDays) return { available: false, period, days: count };
  const days = allDays.slice(-count);

  const searches = SEARCH_MODES.map((mode) => searchesOf(mode, days)).sort((first, second) => second.total - first.total);
  const airlines = AIRLINES.map((airline) => airlineOf(airline, days));
  const each = (valueOf) => allDays.map((day) => ({ day: day.day, value: valueOf(day) }));
  return {
    available: true,
    period,
    days: count,
    searches,
    airlines,
    trend: {
      since: firstCounted(allDays),
      sent: each((day) => sum(AIRLINES.flatMap((airline) => ["asked", "blocked", "error"].map((outcome) => day.read(`airline:${airline}:${outcome}`))))),
      unanswered: allDays.map((day) => {
        const fields = Object.keys(day.counts ?? {});
        return {
          day: day.day,
          value: sum(SEARCH_MODES.map((mode) => day.read(`search:${mode}`))),
          empty: sum(SEARCH_MODES.map((mode) => day.read(`search:${mode}:empty`))),
          failed: sum(fields.filter((field) => /^search:[^:]+:fail:/.test(field)).map(day.read)),
        };
      }),
      problems: each((day) => sum(AIRLINES.flatMap((airline) => ["blocked", "error", "paused", "busy"].map((outcome) => day.read(`airline:${airline}:${outcome}`))))),
    },
  };
};
