// A trip shared by link, for its public page and preview image. Read through the database function
// shared_trip (the visitor needs no account and never reaches the tables): { trip, owner: { name, avatar } }
// or null when the link does not exist (never did, or was turned off).
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

// Share ids are 12 url-safe base64 characters
const SHARE_ID = /^[\w-]{12}$/;

// Once per request: the page and its metadata ask for the same trip
export const getSharedTrip = cache(async (shareId) => {
  if (!SHARE_ID.test(shareId)) return null;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("shared_trip", { share_id: shareId });
  if (error) throw error;
  return data;
});
