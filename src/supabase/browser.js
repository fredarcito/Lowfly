"use client";

// Supabase in the browser: sign in and out, and the account's trips (store/tripsCloud).
// Only the publishable key reaches the browser; row level security keeps each person to their own rows.
import { createBrowserClient } from "@supabase/ssr";

let client = null;

// One client for the whole page (it keeps the session in cookies, shared with the server)
export const supabaseBrowser = () => {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return client;
};
