// The accounts for the admin: the list with what each has done and cost, and one account in full (its trips,
// shares, AI itineraries and daily limit). Read with the secret key; only admin pages call it.
import { supabaseAdmin } from "@/supabase/admin";
import { aiCallCost } from "@/server/admin/aiPrices";
import { USAGE_COLUMNS, allRows, allUsers } from "@/server/admin/queries";
import { globalItineraryLimit } from "@/server/itineraryLimits";
import { FILTERS, SORTS, USERS_PER_PAGE } from "@/constants/adminUserList";

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

// Sorts accounts by `sort` (constants/adminUserList) in `dir`; accounts without the figure (never signed in) last
const sortUsers = (users, sort, dir) => {
  const { field } = SORTS[sort];
  const order = dir === "asc" ? 1 : -1;
  const valueOf = (user) => {
    const value = user[field];
    if (value === null || value === undefined) return null;
    if (field === "createdAt" || field === "lastSignInAt") return new Date(value).getTime();
    return value;
  };
  return users.toSorted((first, second) => {
    const [firstValue, secondValue] = [valueOf(first), valueOf(second)];
    if (firstValue === null || secondValue === null) return firstValue === secondValue ? 0 : firstValue === null ? 1 : -1;
    const compared = typeof firstValue === "string" ? firstValue.localeCompare(secondValue) : firstValue - secondValue;
    return compared * order || new Date(second.createdAt) - new Date(first.createdAt);
  });
};

// One page of the accounts for the admin's list, as `view` asks (constants/adminUserList: search, filter, sort,
// page): { users, total (found), page, pages, globalLimit }
export const listAdminUsers = async ({ q: search = "", filter = "all", sort = "joined", dir = "desc", page = 1 } = {}) => {
  const supabase = supabaseAdmin();
  const [users, usage, trips, saved, limits, globalLimit] = await Promise.all([
    allUsers(supabase),
    allRows(supabase, "itinerary_usage", USAGE_COLUMNS),
    // Whether each trip has an itinerary now: only its date, not the whole itinerary
    allRows(supabase, "trips", "user_id, itinerary:data->itinerary->>createdAt", { orderBy: "updated_at" }),
    allRows(supabase, "trip_history", "user_id", { orderBy: "saved_at" }),
    allRows(supabase, "user_limits", "user_id, itineraries_per_day", { orderBy: "updated_at" }),
    globalItineraryLimit(),
  ]);
  const spent = usageByUser(usage);
  const tripCounts = countBy(trips, "user_id");
  const savedCounts = countBy(saved, "user_id");
  const withItineraryCounts = countBy(trips.filter((trip) => trip.itinerary), "user_id");
  const ownLimits = Object.fromEntries(limits.map((row) => [row.user_id, row.itineraries_per_day]));
  const wanted = search.trim().toLowerCase();
  const found = users
    .map((user) => {
      const itinerariesActive = withItineraryCounts[user.id] ?? 0;
      return {
        ...profileOf(user),
        // Active (kept now) and over all time (deleted ones too): trips (trip_history) and itineraries (every one
        // the AI made, itinerary_usage; never fewer than the active ones, made before their cost was kept)
        trips: tripCounts[user.id] ?? 0,
        tripsSaved: Math.max(savedCounts[user.id] ?? 0, tripCounts[user.id] ?? 0),
        itinerariesActive,
        itineraries: Math.max(spent[user.id]?.itineraries ?? 0, itinerariesActive),
        cost: spent[user.id]?.cost ?? 0,
        ownLimit: ownLimits[user.id] ?? null,
      };
    })
    .filter((user) => !wanted || user.email?.toLowerCase().includes(wanted) || user.name?.toLowerCase().includes(wanted))
    .filter(FILTERS[filter] ?? FILTERS.all);
  const pages = Math.max(1, Math.ceil(found.length / USERS_PER_PAGE));
  const current = Math.min(page, pages);
  return {
    globalLimit,
    total: found.length,
    page: current,
    pages,
    users: sortUsers(found, sort, dir).slice((current - 1) * USERS_PER_PAGE, current * USERS_PER_PAGE),
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

// What an account did, newest first: each trip it saved ({ type: "trip", at, destination, manual, deleted }, deleted
// ones too) and each itinerary it made ({ type: "itinerary", at, cities, days, cost }: one per request, however
// many towns). `saved`: its trip_history rows; `calls`: its AI calls with their cost; `keptIds`: its trips now.
const historyOf = (saved, calls, keptIds) => {
  const trips = saved.map((row) => ({
    type: "trip",
    at: row.saved_at,
    destination: row.destination,
    manual: row.kind === "manual",
    deleted: !keptIds.has(row.trip_id),
  }));
  const requests = new Map();
  for (const call of calls) {
    const request = requests.get(call.request_id) ?? { type: "itinerary", at: call.created_at, cities: [], days: 0, cost: 0 };
    if (call.created_at < request.at) request.at = call.created_at;
    if (!request.cities.includes(call.city)) request.cities.push(call.city);
    request.days += call.days ?? 0;
    request.cost += call.cost;
    requests.set(call.request_id, request);
  }
  return [...trips, ...requests.values()].sort((first, second) => new Date(second.at) - new Date(first.at));
};

// One account in full, or null when there is none with that id
export const getAdminUser = async (userId) => {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data?.user) return null;
  const mine = { filter: (query) => query.eq("user_id", userId) };
  const [trips, saved, shares, usage, limits, globalLimit] = await Promise.all([
    allRows(supabase, "trips", "data", { ...mine, orderBy: "updated_at" }),
    allRows(supabase, "trip_history", "trip_id, kind, destination, saved_at", { ...mine, orderBy: "saved_at" }),
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
    tripsSaved: saved.length,
    history: historyOf(saved, calls, new Set(trips.map((row) => row.data.id))),
    usage: calls,
    itineraries: new Set(usage.map((row) => row.request_id)).size,
    cost: calls.reduce((total, call) => total + call.cost, 0),
    ownLimit: limits[0]?.itineraries_per_day ?? null,
    globalLimit,
  };
};
