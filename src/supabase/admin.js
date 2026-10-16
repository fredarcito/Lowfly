// Supabase on the server with the secret key: skips RLS, for the tables no visitor may touch
// (e.g. itinerary_usage). Never import it from code that reaches the browser.
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
