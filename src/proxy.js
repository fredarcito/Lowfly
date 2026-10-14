import { NextResponse } from "next/server";
import { LOCALES, pickLocale } from "@/i18n/config";

// No language in the URL (/ or /something) → redirect to the browser language (/es or /en)
export const proxy = (request) => {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  request.nextUrl.pathname = `/${pickLocale(request.headers.get("accept-language") || "")}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
};

export const config = {
  // Skip the API, Next internals and files (favicon.ico, etc.)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
