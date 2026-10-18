import { NextResponse } from "next/server";
import { LOCALES, pickLocale } from "@/i18n/config";
import { folderOf, sectionIn } from "@/constants/sections";
import { refreshSession } from "@/supabase/session";

// No language in the URL (/ or /something) → redirect to the browser language (/es or /en).
// A section named in each language (constants/sections): its name in the page's language shows its folder's page
// (/es/guias → src/app/[lang]/guides), and any other name for it is sent there for good (/es/guides → /es/guias,
// /en/guias → /en/guides: old or hand-written links).
// Pages in a language keep the Supabase session fresh (signed-in visitors).
export const proxy = async (request) => {
  const { pathname } = request.nextUrl;
  const lang = LOCALES.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (!lang) {
    request.nextUrl.pathname = `/${pickLocale(request.headers.get("accept-language") || "")}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const [, , section, ...rest] = pathname.split("/");
  const folder = section ? folderOf(section) : null;
  if (!folder) return refreshSession(request);
  const tail = rest.length ? `/${rest.join("/")}` : "";
  const name = sectionIn(lang, folder);
  if (section !== name) {
    const url = request.nextUrl.clone();
    url.pathname = `/${lang}/${name}${tail}`;
    return NextResponse.redirect(url, 308);
  }
  if (name === folder) return refreshSession(request);
  const page = request.nextUrl.clone();
  page.pathname = `/${lang}/${folder}${tail}`;
  return refreshSession(request, page);
};

export const config = {
  // Skip the API, Next internals and files (favicon.ico, etc.)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
