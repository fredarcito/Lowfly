// Parameter validation and shared response handling for the route handlers
import { NextResponse } from "next/server";
import { isDay, nightsBetween } from "@/lib/dates";
import { AppError, badRequest } from "@/lib/errors";
import { DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/config";
import { WEEKEND } from "@/lib/weekend";

export function iata(v) {
  const code = (v || "").toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw badRequest("badOrigin");
  return code;
}

export function day(v) {
  if (!isDay(v)) throw badRequest("missingDate");
  return v;
}

export function country(v) {
  if (!v) throw badRequest("missingCountry");
  return v;
}

export function range(from, to, maxDays) {
  if (to < from) throw badRequest("rangeOrder");
  if (nightsBetween(from, to) > maxDays) throw badRequest("rangeTooLong", { max: maxDays });
}

export const maxPrice = (v) => Number(v) || Infinity;

// Language for country and city names (?lang=en)
export const lang = (p) => (hasLocale(p.get("lang")) ? p.get("lang") : DEFAULT_LOCALE);

// Stay for a return trip (trip=return&minN=2&maxN=7). Returns null for one way.
// With weekend=1, the stay is a weekend away (lib/weekend) instead of minN to maxN nights.
export function stay(p, from, to) {
  if (p.get("trip") !== "return") return null;
  if (p.get("weekend") === "1") {
    if (nightsBetween(from, to) < WEEKEND.stay.min) throw badRequest("stayTooShort", { min: WEEKEND.stay.min });
    return WEEKEND.stay;
  }
  const min = Number(p.get("minN"));
  const max = Number(p.get("maxN"));
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < min || max > 30) throw badRequest("stayInvalid");
  if (nightsBetween(from, to) < min) throw badRequest("stayTooShort", { min });
  return { min, max };
}

// Wraps a handler: returns JSON, 400 if the parameters are invalid, 502 if the airlines fail
export function handle(fn) {
  return async (req) => {
    try {
      const data = await fn(req.nextUrl.searchParams);
      return NextResponse.json(data, {
        headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=300" },
      });
    } catch (e) {
      if (e instanceof AppError) return NextResponse.json({ error: e.code, params: e.params }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: "unknown" }, { status: 502 });
    }
  };
}
