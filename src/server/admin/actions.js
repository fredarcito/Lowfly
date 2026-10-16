"use server";

// What the admin can change: an account (name, email, admin, blocked) or the account itself (deleted), its
// itineraries (deleted), its own daily limit, the app-wide limit.
// Server actions can be called by anyone who finds them: each one checks the caller is an admin first.
// Answers { ok: true } or { error } (a short reason, for the admin).
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/supabase/admin";
import { currentAdmin, isAdmin } from "@/server/admin/access";
import { LIMIT_SETTING } from "@/server/itineraryLimits";

// A daily limit the admin may set
const MAX_LIMIT = 100;
const validLimit = (value) => Number.isInteger(value) && value >= 0 && value <= MAX_LIMIT;

const done = (error) => {
  if (error) {
    console.error("Admin change failed", error.message);
    return { error: error.message };
  }
  revalidatePath("/[lang]/admin", "layout");
  return { ok: true };
};

const forbidden = { error: "forbidden" };

// Removes a trip's itinerary (the trip stays). The person's browser takes the account's version the next time
// the app opens, so it goes there too.
export const deleteItinerary = async (userId, tripId) => {
  if (!(await isAdmin())) return forbidden;
  const supabase = supabaseAdmin();
  const { data: row, error } = await supabase.from("trips").select("data").eq("user_id", userId).eq("id", tripId).maybeSingle();
  if (error || !row) return done(error ?? { message: "trip not found" });
  const { error: updateError } = await supabase
    .from("trips")
    .update({ data: { ...row.data, itinerary: null }, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", tripId);
  return done(updateError);
};

// The account's own daily limit; null goes back to the app-wide one
export const setOwnLimit = async (userId, limit) => {
  if (!(await isAdmin())) return forbidden;
  const table = supabaseAdmin().from("user_limits");
  if (limit === null) return done((await table.delete().eq("user_id", userId)).error);
  if (!validLimit(limit)) return { error: "invalid limit" };
  return done((await table.upsert({ user_id: userId, itineraries_per_day: limit, updated_at: new Date().toISOString() })).error);
};

// The daily limit of every account without one of its own
export const setGlobalLimit = async (limit) => {
  if (!(await isAdmin())) return forbidden;
  if (!validLimit(limit)) return { error: "invalid limit" };
  const { error } = await supabaseAdmin()
    .from("app_settings")
    .upsert({ key: LIMIT_SETTING, value: limit, updated_at: new Date().toISOString() });
  return done(error);
};

// How long "blocked" lasts: as good as for ever, until the admin unblocks
const BLOCKED_FOR = "876000h";

// Changes an account: `name`, `email` (only for one that signs in with email), whether it is an admin, whether it is
// blocked. An admin cannot take away their own role or block themselves (they would lose the admin).
export const updateAccount = async (userId, { name, email, admin, blocked }) => {
  const me = await currentAdmin();
  if (!me) return forbidden;
  if (userId === me.id && (!admin || blocked)) return { error: "self" };
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data?.user) return done(error ?? { message: "account not found" });
  const user = data.user;
  const changes = {
    user_metadata: { ...user.user_metadata, full_name: String(name ?? "").trim().slice(0, 100) || null },
    app_metadata: { ...user.app_metadata, role: admin ? "admin" : null },
    ban_duration: blocked ? BLOCKED_FOR : "none",
  };
  const google = user.app_metadata?.providers?.includes("google");
  const newEmail = String(email ?? "").trim().toLowerCase();
  if (!google && newEmail && newEmail !== user.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return { error: "invalid email" };
    // Changed by the admin: already confirmed (no email to the old or new address)
    Object.assign(changes, { email: newEmail, email_confirm: true });
  }
  return done((await supabase.auth.admin.updateUserById(userId, changes)).error);
};

// Deletes an account for good: its trips, shares and limits go with it; its AI usage stays, without it (it is the
// app's cost). An admin cannot delete their own.
export const deleteAccount = async (userId) => {
  const me = await currentAdmin();
  if (!me) return forbidden;
  if (userId === me.id) return { error: "self" };
  return done((await supabaseAdmin().auth.admin.deleteUser(userId)).error);
};
