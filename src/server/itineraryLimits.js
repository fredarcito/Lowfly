// How many AI itineraries a day: the account's own limit (user_limits) if the admin gave it one, else the
// app-wide one (app_settings, changed in the admin), else the app's default (constants/itineraryLimits).
// Only called from the server: both tables are read with the secret key.
import { supabaseAdmin } from "@/supabase/admin";
import { ITINERARY_LIMITS } from "@/constants/itineraryLimits";

export const LIMIT_SETTING = "itineraries_per_day";

const readable = () => Boolean(process.env.SUPABASE_SECRET_KEY);

// The app-wide daily limit
export const globalItineraryLimit = async () => {
  if (!readable()) return ITINERARY_LIMITS.userPerDay;
  const { data, error } = await supabaseAdmin().from("app_settings").select("value").eq("key", LIMIT_SETTING).maybeSingle();
  if (error) console.error("Could not read the itinerary limit", error.message);
  return Number.isInteger(data?.value) ? data.value : ITINERARY_LIMITS.userPerDay;
};

// One account's daily limit
export const itineraryLimitFor = async (userId) => {
  if (!readable()) return ITINERARY_LIMITS.userPerDay;
  const { data, error } = await supabaseAdmin().from("user_limits").select("itineraries_per_day").eq("user_id", userId).maybeSingle();
  if (error) console.error("Could not read the account's itinerary limit", error.message);
  return data?.itineraries_per_day ?? globalItineraryLimit();
};
