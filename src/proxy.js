import { NextResponse } from "next/server";
import { LOCALES, pickLocale } from "@/i18n/config";
import { folderOf, sectionIn } from "@/constants/sections";
import { SEARCH_PAGES } from "@/constants/searchPages";
import { ROUTES } from "@/constants/routes";
import { refreshSession } from "@/supabase/session";

// No language in the URL (/ or /something) → redirect to the browser language (/es or /en).
// A section named in each language (constants/sections): its name in the page's language shows its folder's page
// (/es/guias → src/app/[lang]/guides), and any other name for it is sent there for good (/es/guides → /es/guias,
// /en/guias → /en/guides: old or hand-written links).
// A search shared before each kind had its page (/es?m=multiCity&o=MLA…) is sent to its page, with the same search
// (/es/recorridos?o=MLA…).
// Pages in a language keep the Supabase session fresh (signed-in visitors).
export const proxy = async (request) => {
  const { pathname } = request.nextUrl;
  const lang = LOCALES.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (!lang) {
    request.nextUrl.pathname = `/${pickLocale(request.headers.get("accept-language") || "")}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const oldSearch = request.nextUrl.searchParams.get("m");
  if (pathname === `/${lang}` && SEARCH_PAGES[oldSearch]) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.search(lang, oldSearch);
    url.searchParams.delete("m");
    return NextResponse.redirect(url, 308);
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
  // Skip the API, Next internals, files (favicon.ico, etc.) and BotID's own paths (botid/next/config's rewrites to
  // Vercel: never sent to a language)
  matcher: ["/((?!api|_next|149e9513-01fa-4fb0-aad4-566afd725d1b|.*\\..*).*)"],
};
