"use client";

// The account's copy of "My trips" in Supabase (table public.trips: one row per trip, the trip whole in `data`).
// On signing in, the account's trips and the ones saved in this browser before are put together; from then on
// every change made here is copied to the account, so the trips are the same on every device.
import { supabaseBrowser } from "@/supabase/browser";
import { onTripsChanged, readTrips, replaceTrips } from "@/store/trips";

const TABLE = "trips";

export const tripRow = (userId, trip) => ({ user_id: userId, id: trip.id, data: trip, updated_at: new Date().toISOString() });

const report = (action) => ({ error }) => error && console.error(`Trips in the account: could not ${action}`, error.message);

// Copies to the account what changed between two versions of the list: new or changed trips, and deleted ones
const copyChanges = (userId, previous, next) => {
  const supabase = supabaseBrowser();
  const before = new Map(previous.map((trip) => [trip.id, trip]));
  const changed = next.filter((trip) => before.get(trip.id) !== trip);
  const nextIds = new Set(next.map((trip) => trip.id));
  const removed = previous.filter((trip) => !nextIds.has(trip.id)).map((trip) => trip.id);
  if (changed.length) supabase.from(TABLE).upsert(changed.map((trip) => tripRow(userId, trip))).then(report("save"));
  if (removed.length) supabase.from(TABLE).delete().in("id", removed).then(report("delete"));
};

// Joins the account's trips with this browser's (a trip in both keeps the account's version), uploads the ones
// only here, and keeps copying the changes. Returns how to stop.
export const startTripsCloud = async (userId) => {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase.from(TABLE).select("data");
  if (error) {
    report("load")({ error });
    return () => {};
  }
  const saved = data.map((row) => row.data);
  const savedIds = new Set(saved.map((trip) => trip.id));
  const onlyHere = readTrips().filter((trip) => !savedIds.has(trip.id));
  if (onlyHere.length) await supabase.from(TABLE).upsert(onlyHere.map((trip) => tripRow(userId, trip))).then(report("upload"));
  replaceTrips([...saved, ...onlyHere]);
  return onTripsChanged((previous, next) => copyChanges(userId, previous, next));
};

// Signed out: this browser forgets the account's trips (they stay in the account)
export const forgetTrips = () => replaceTrips([]);
