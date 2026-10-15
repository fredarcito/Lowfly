import { NextResponse } from "next/server";
import { LOCALES, pickLocale } from "@/i18n/config";
import { refreshSession } from "@/supabase/session";

// No language in the URL (/ or /something) → redirect to the browser language (/es or /en).
// Pages in a language keep the Supabase session fresh (signed-in visitors).
export const proxy = async (request) => {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return refreshSession(request);

  request.nextUrl.pathname = `/${pickLocale(request.headers.get("accept-language") || "")}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  // Skip the API, Next internals and files (favicon.ico, etc.)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
