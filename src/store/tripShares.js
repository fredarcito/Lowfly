"use client";

// Sharing a trip by link (table public.trip_shares: one row per shared trip, its random id is the link).
// The trip keeps its share's id (`shareId`), so the page knows it is shared and the link stays the same.
// Anyone with the link reads it through the public function shared_trip (server/sharedTrips).
import { supabaseBrowser } from "@/supabase/browser";
import { tripRow } from "@/store/tripsCloud";
import { readTrips, updateTrip } from "@/store/trips";

const TABLE = "trip_shares";

// Postgres: the row already exists (the trip was shared meanwhile, e.g. from another tab)
const ALREADY_EXISTS = "23505";

// The trip's share id in the account, or null
const findShare = async (supabase, tripId) => {
  const found = await supabase.from(TABLE).select("id").eq("trip_id", tripId).maybeSingle();
  if (found.error) throw found.error;
  return found.data?.id ?? null;
};

const createShare = async (userId, trip) => {
  const supabase = supabaseBrowser();
  // The share points to the trip in the account: make sure it is there (a trip saved a moment ago may not be yet)
  // (as saved: the page shows it with the names in its language)
  const saved = readTrips().find((candidate) => candidate.id === trip.id) ?? trip;
  const uploaded = await supabase.from("trips").upsert(tripRow(userId, saved));
  if (uploaded.error) throw uploaded.error;
  let shareId = await findShare(supabase, trip.id);
  if (!shareId) {
    const created = await supabase.from(TABLE).insert({ trip_id: trip.id }).select("id").single();
    if (created.error?.code === ALREADY_EXISTS) shareId = await findShare(supabase, trip.id);
    else if (created.error) throw created.error;
    else shareId = created.data.id;
  }
  updateTrip(trip.id, { shareId });
  return shareId;
};

// Shares being created, by trip id: asking again meanwhile (a double click, React running effects twice in
// development) waits for the same one instead of creating a second
const creating = new Map();

// The id of the trip's link, created the first time. Throws when it cannot.
export const shareTrip = (userId, trip) => {
  if (trip.shareId) return Promise.resolve(trip.shareId);
  if (!creating.has(trip.id)) {
    creating.set(trip.id, createShare(userId, trip).finally(() => creating.delete(trip.id)));
  }
  return creating.get(trip.id);
};

// Turns the link off: whoever opens it from now on finds nothing
export const stopSharing = async (trip) => {
  const { error } = await supabaseBrowser().from(TABLE).delete().eq("trip_id", trip.id);
  if (error) throw error;
  updateTrip(trip.id, { shareId: null });
};
