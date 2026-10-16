// The admin's figures: accounts, AI itineraries and what they cost, the destinations most planned, saved and
// shared trips. Read with the secret key (only the admin page calls it, after checking the visitor is an admin).
import { supabaseAdmin } from "@/supabase/admin";
import { aiCallCost } from "@/server/admin/aiPrices";
import { USAGE_COLUMNS, allRows, allUsers, countRows } from "@/server/admin/queries";

const DAY = 86_400_000;
// The daily charts cover this many days, today included
const DAYS = 30;
const TOP_DESTINATIONS = 10;

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

// The last DAYS days, oldest first: ["2026-09-17", …, today]
const lastDays = () => Array.from({ length: DAYS }, (_, index) => dayKey(Date.now() - (DAYS - 1 - index) * DAY));

// [{ day, value }] for the last days, adding up `valueOf(item)` per day of `dateOf(item)`
const perDay = (items, dateOf, valueOf = () => 1) => {
  const totals = Object.fromEntries(lastDays().map((day) => [day, 0]));
  for (const item of items) {
    const day = dayKey(dateOf(item));
    if (day in totals) totals[day] += valueOf(item);
  }
  return Object.entries(totals).map(([day, value]) => ({ day, value }));
};

export const getAdminStats = async () => {
  const supabase = supabaseAdmin();
  const [users, usage, savedTrips, sharedTrips] = await Promise.all([
    allUsers(supabase),
    allRows(supabase, "itinerary_usage", USAGE_COLUMNS),
    countRows(supabase, "trips"),
    countRows(supabase, "trip_shares"),
  ]);
  const since = Date.now() - DAYS * DAY;
  const recentUsage = usage.filter((row) => new Date(row.created_at).getTime() >= since);
  // One itinerary may take several AI calls (one per town): counted by request
  const recentItineraries = new Set(recentUsage.map((row) => row.request_id)).size;
  const recentCost = recentUsage.reduce((total, row) => total + aiCallCost(row), 0);

  // The first call of each itinerary, for counting itineraries per day
  const firstCalls = [...new Map(usage.map((row) => [row.request_id, row])).values()];

  const destinations = new Map();
  for (const row of firstCalls) {
    const key = `${row.city}|${row.country ?? ""}`;
    destinations.set(key, { city: row.city, country: row.country, count: (destinations.get(key)?.count ?? 0) + 1 });
  }

  return {
    days: DAYS,
    users: {
      total: users.length,
      lastWeek: users.filter((user) => new Date(user.created_at).getTime() >= Date.now() - 7 * DAY).length,
      google: users.filter((user) => user.app_metadata?.providers?.includes("google")).length,
      email: users.filter((user) => !user.app_metadata?.providers?.includes("google")).length,
      daily: perDay(users, (user) => user.created_at),
    },
    itineraries: {
      recent: recentItineraries,
      recentCost,
      costPerItinerary: recentItineraries ? recentCost / recentItineraries : 0,
      // Claude stepping in when Gemini was busy, as a share of the AI calls
      claudeShare: recentUsage.length ? recentUsage.filter((row) => row.provider === "claude").length / recentUsage.length : 0,
      daily: perDay(firstCalls, (row) => row.created_at),
      dailyCost: perDay(usage, (row) => row.created_at, aiCallCost),
    },
    destinations: [...destinations.values()].sort((first, second) => second.count - first.count).slice(0, TOP_DESTINATIONS),
    trips: { saved: savedTrips, shared: sharedTrips },
  };
};
