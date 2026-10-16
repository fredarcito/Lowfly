// The accounts for the admin: the list with what each has done and cost, and one account in full (its trips,
// shares, AI itineraries and daily limit). Read with the secret key; only admin pages call it.
import { supabaseAdmin } from "@/supabase/admin";
import { aiCallCost } from "@/server/admin/aiPrices";
import { USAGE_COLUMNS, allRows, allUsers } from "@/server/admin/queries";
import { globalItineraryLimit } from "@/server/itineraryLimits";

// What the admin shows of an account
const profileOf = (user) => ({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  google: Boolean(user.app_metadata?.providers?.includes("google")),
  admin: user.app_metadata?.role === "admin",
  // Blocked by the admin: cannot sign in until unblocked
  blocked: Boolean(user.banned_until && new Date(user.banned_until) > new Date()),
  createdAt: user.created_at,
  lastSignInAt: user.last_sign_in_at ?? null,
});

// Each account's AI itineraries (one per request, however many towns) and their cost: { userId: { itineraries, cost } }
const usageByUser = (rows) => {
  const totals = {};
  for (const row of rows) {
    if (!row.user_id) continue;
    const total = (totals[row.user_id] ??= { requests: new Set(), cost: 0 });
    total.requests.add(row.request_id);
    total.cost += aiCallCost(row);
  }
  return Object.fromEntries(Object.entries(totals).map(([userId, total]) => [userId, { itineraries: total.requests.size, cost: total.cost }]));
};

const countBy = (rows, key) => rows.reduce((counts, row) => ({ ...counts, [row[key]]: (counts[row[key]] ?? 0) + 1 }), {});

// Every account, newest first, or the ones whose email or name has `query`
export const listAdminUsers = async (query = "") => {
  const supabase = supabaseAdmin();
  const [users, usage, trips, limits, globalLimit] = await Promise.all([
    allUsers(supabase),
    allRows(supabase, "itinerary_usage", USAGE_COLUMNS),
    allRows(supabase, "trips", "user_id", { orderBy: "updated_at" }),
    allRows(supabase, "user_limits", "user_id, itineraries_per_day", { orderBy: "updated_at" }),
    globalItineraryLimit(),
  ]);
  const spent = usageByUser(usage);
  const tripCounts = countBy(trips, "user_id");
  const ownLimits = Object.fromEntries(limits.map((row) => [row.user_id, row.itineraries_per_day]));
  const wanted = query.trim().toLowerCase();
  return {
    globalLimit,
    users: users
      .map((user) => ({
        ...profileOf(user),
        trips: tripCounts[user.id] ?? 0,
        itineraries: spent[user.id]?.itineraries ?? 0,
        cost: spent[user.id]?.cost ?? 0,
        ownLimit: ownLimits[user.id] ?? null,
      }))
      .filter((user) => !wanted || user.email?.toLowerCase().includes(wanted) || user.name?.toLowerCase().includes(wanted))
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)),
  };
};

// What each trip's itineraries cost, from the calls that name it (`rows`: oldest first): { tripId: { latest,
// generations, total } }, `latest` being the last one made (the one it has, unless a later attempt failed) with
// its tokens and cost. A trip planned through several towns makes one call per town: added up per request.
const costByTrip = (rows) => {
  const trips = {};
  for (const row of rows) {
    if (!row.trip_id) continue;
    const trip = (trips[row.trip_id] ??= { requests: new Map(), total: 0 });
    const request = trip.requests.get(row.request_id) ?? { inputTokens: 0, outputTokens: 0, cost: 0 };
    const cost = aiCallCost(row);
    request.inputTokens += row.input_tokens ?? 0;
    request.outputTokens += row.output_tokens ?? 0;
    request.cost += cost;
    trip.requests.set(row.request_id, request);
    trip.total += cost;
  }
  return Object.fromEntries(
    Object.entries(trips).map(([tripId, trip]) => [tripId, { latest: [...trip.requests.values()].at(-1), generations: trip.requests.size, total: trip.total }])
  );
};

// One trip as the admin lists it: where, when, whether it has an itinerary (and what the AI cost) and is shared
const tripSummary = (trip, sharedIds, aiCost) => ({
  id: trip.id,
  title: trip.manual ? trip.stops?.map((stop) => stop.city).join(" → ") : `${trip.fare?.city}, ${trip.fare?.country}`,
  manual: Boolean(trip.manual),
  from: trip.fare?.day ?? trip.stops?.[0]?.arrive?.day ?? null,
  to: trip.fare?.ret?.day ?? trip.stops?.at(-1)?.leave?.day ?? null,
  savedAt: trip.savedAt ?? null,
  booked: Boolean(trip.booked),
  itineraryDays: trip.itinerary?.days?.length ?? 0,
  shared: sharedIds.has(trip.id),
  aiCost: aiCost ?? null,
});

// One account in full, or null when there is none with that id
export const getAdminUser = async (userId) => {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data?.user) return null;
  const mine = { filter: (query) => query.eq("user_id", userId) };
  const [trips, shares, usage, limits, globalLimit] = await Promise.all([
    allRows(supabase, "trips", "data", { ...mine, orderBy: "updated_at" }),
    allRows(supabase, "trip_shares", "trip_id", mine),
    allRows(supabase, "itinerary_usage", USAGE_COLUMNS, mine),
    allRows(supabase, "user_limits", "itineraries_per_day", { ...mine, orderBy: "updated_at" }),
    globalItineraryLimit(),
  ]);
  const sharedIds = new Set(shares.map((share) => share.trip_id));
  const calls = usage.map((row) => ({ ...row, cost: aiCallCost(row) })).reverse();
  const tripCosts = costByTrip(usage);
  return {
    ...profileOf(data.user),
    trips: trips.map((row) => tripSummary(row.data, sharedIds, tripCosts[row.data.id])).reverse(),
    usage: calls,
    itineraries: new Set(usage.map((row) => row.request_id)).size,
    cost: calls.reduce((total, call) => total + call.cost, 0),
    ownLimit: limits[0]?.itineraries_per_day ?? null,
    globalLimit,
  };
};
