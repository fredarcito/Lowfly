"use client";

// Sharing a trip by link (table public.trip_shares: one row per shared trip, its random id is the link).
// The trip keeps its share's id (`shareId`), so the page knows it is shared and the link stays the same.
// Anyone with the link reads it through the public function shared_trip (server/sharedTrips).
import { supabaseBrowser } from "@/supabase/browser";
import { tripRow } from "@/store/tripsCloud";
import { readTrips, updateTrip } from "@/store/trips";

const TABLE = "trip_shares";

// The id of the trip's link, created the first time. Throws when it cannot.
export const shareTrip = async (userId, trip) => {
  if (trip.shareId) return trip.shareId;
  const supabase = supabaseBrowser();
  // The share points to the trip in the account: make sure it is there (a trip saved a moment ago may not be yet)
  // (as saved: the page shows it with the names in its language)
  const saved = readTrips().find((candidate) => candidate.id === trip.id) ?? trip;
  const uploaded = await supabase.from("trips").upsert(tripRow(userId, saved));
  if (uploaded.error) throw uploaded.error;
  const found = await supabase.from(TABLE).select("id").eq("trip_id", trip.id).maybeSingle();
  if (found.error) throw found.error;
  let shareId = found.data?.id;
  if (!shareId) {
    const created = await supabase.from(TABLE).insert({ trip_id: trip.id }).select("id").single();
    if (created.error) throw created.error;
    shareId = created.data.id;
  }
  updateTrip(trip.id, { shareId });
  return shareId;
};

// Turns the link off: whoever opens it from now on finds nothing
export const stopSharing = async (trip) => {
  const { error } = await supabaseBrowser().from(TABLE).delete().eq("trip_id", trip.id);
  if (error) throw error;
  updateTrip(trip.id, { shareId: null });
};
