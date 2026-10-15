// Keeps the Supabase session fresh on every page request (called from src/proxy.js): reading the claims
// refreshes an expired token, and the new cookies go to both the request and the response.
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const refreshSession = async (request) => {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // Nothing may run between creating the client and this call (Supabase: or sessions end at random)
  await supabase.auth.getClaims();
  // This exact response carries the refreshed cookies
  return response;
};
