import { NextResponse } from "next/server";
import { supabaseServer } from "@/supabase/server";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";

// Back from signing in (Google, or the link in the email): the one-time code becomes a session in the
// cookies, then the visitor goes on to `next` (a page of this site), or back to the login page with an error.
// GET /api/auth/callback?code=…&next=/es/trips
export const GET = async (request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const asked = searchParams.get("next") ?? "";
  // Only pages of this site ("/es/trips"), never another address ("//evil.com")
  const next = asked.startsWith("/") && !asked.startsWith("//") ? asked : `/${DEFAULT_LOCALE}`;
  const lang = next.split("/")[1];

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Sign in failed", error.message);
  }
  return NextResponse.redirect(`${origin}/${hasLocale(lang) ? lang : DEFAULT_LOCALE}/login?error=1&next=${encodeURIComponent(next)}`);
};
