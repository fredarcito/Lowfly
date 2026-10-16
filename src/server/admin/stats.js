// The admin's figures for a period: accounts (and sign-ups in it), saved and shared trips, the AI itineraries made
// in it (against the period before), what they cost, each day of it, and the destinations most planned (all time).
// Read with the secret key (only the admin page calls it, after checking the visitor is an admin).
import { supabaseAdmin } from "@/supabase/admin";
import { aiCallCost } from "@/server/admin/aiPrices";
import { USAGE_COLUMNS, allRows, allUsers, countRows } from "@/server/admin/queries";

const DAY = 86_400_000;
const TOP_DESTINATIONS = 10;
// The periods the admin can pick, in days ("all": since the first account)
export const PERIODS = ["7", "30", "90", "all"];
export const DEFAULT_PERIOD = "30";

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

// The period's days, oldest first: ["2026-09-17", …, today]
const daysOf = (count) => Array.from({ length: count }, (_, index) => dayKey(Date.now() - (count - 1 - index) * DAY));

// [{ day, value }] for `days`, adding up `valueOf(item)` per day of `dateOf(item)`
const perDay = (days, items, dateOf, valueOf = () => 1) => {
  const totals = Object.fromEntries(days.map((day) => [day, 0]));
  for (const item of items) {
    const day = dayKey(dateOf(item));
    if (day in totals) totals[day] += valueOf(item);
  }
  return Object.entries(totals).map(([day, value]) => ({ day, value }));
};

// The itineraries among `rows` (one per request, however many towns), each as its first call
const firstCallsOf = (rows) => [...new Map(rows.map((row) => [row.request_id, row])).values()];

export const getAdminStats = async (period = DEFAULT_PERIOD) => {
  const supabase = supabaseAdmin();
  const [users, usage, savedTrips, sharedTrips] = await Promise.all([
    allUsers(supabase),
    allRows(supabase, "itinerary_usage", USAGE_COLUMNS),
    countRows(supabase, "trips"),
    countRows(supabase, "trip_shares"),
  ]);
  const at = (row) => new Date(row.created_at).getTime();
  // "all": from the first account's day (at least one day)
  const firstDay = Math.min(Date.now(), ...users.map(at));
  const dayCount = period === "all" ? Math.max(1, Math.ceil((Date.now() - firstDay) / DAY) + 1) : Number(period);
  const days = daysOf(dayCount);
  const since = new Date(`${days[0]}T00:00:00Z`).getTime();
  const before = since - dayCount * DAY;

  const calls = usage.filter((row) => at(row) >= since);
  const itineraries = firstCallsOf(calls);
  const cost = calls.reduce((total, row) => total + aiCallCost(row), 0);

  const destinations = new Map();
  for (const row of firstCallsOf(usage)) {
    const key = `${row.city}|${row.country ?? ""}`;
    destinations.set(key, { city: row.city, country: row.country, count: (destinations.get(key)?.count ?? 0) + 1 });
  }

  return {
    period,
    days: dayCount,
    users: {
      total: users.length,
      google: users.filter((user) => user.app_metadata?.providers?.includes("google")).length,
      email: users.filter((user) => !user.app_metadata?.providers?.includes("google")).length,
      inPeriod: users.filter((user) => at(user) >= since).length,
    },
    trips: { saved: savedTrips, shared: sharedTrips },
    itineraries: {
      count: itineraries.length,
      // The period before it, as long (none for "all")
      previous: period === "all" ? null : firstCallsOf(usage.filter((row) => at(row) >= before && at(row) < since)).length,
      cost,
      costPerItinerary: itineraries.length ? cost / itineraries.length : 0,
      // Claude stepping in when Gemini was busy, as a share of the AI calls
      claudeShare: calls.length ? calls.filter((row) => row.provider === "claude").length / calls.length : 0,
    },
    daily: {
      users: perDay(days, users, (user) => user.created_at),
      itineraries: perDay(days, itineraries, (row) => row.created_at),
      cost: perDay(days, calls, (row) => row.created_at, aiCallCost),
    },
    destinations: [...destinations.values()].sort((first, second) => second.count - first.count).slice(0, TOP_DESTINATIONS),
  };
};
