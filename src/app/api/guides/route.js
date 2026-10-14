import { NextResponse } from "next/server";
import { getGuides } from "@/server/guides";
import { hasLocale } from "@/i18n/config";

// GET /api/guides?codes=BRI,FCO&lang=es → why each destination is worth a visit (or null)
export const GET = (request) => {
  const params = request.nextUrl.searchParams;
  const codes = [...new Set((params.get("codes") || "").toUpperCase().split(","))].filter((code) => /^[A-Z]{3}$/.test(code)).slice(0, 20);
  const lang = hasLocale(params.get("lang")) ? params.get("lang") : "es";
  return NextResponse.json(getGuides(codes, lang), {
    headers: { "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
};
