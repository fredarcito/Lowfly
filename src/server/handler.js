// Parameter validation and shared response handling for the route handlers
import { NextResponse } from "next/server";
import { isDay, nightsBetween } from "@/utils/dates";
import { AppError, badRequest } from "@/server/errors";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";
import { WEEKEND } from "@/constants/weekend";

export const iata = (value) => {
  const code = (value || "").toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) throw badRequest("badOrigin");
  return code;
};

export const day = (value) => {
  if (!isDay(value)) throw badRequest("missingDate");
  return value;
};

export const country = (value) => {
  if (!value) throw badRequest("missingCountry");
  return value;
};

// Optional city inside the country (?city=Roma); null searches the whole country
export const city = (value) => value?.trim().slice(0, 80) || null;

export const range = (from, to, maxDays) => {
  if (to < from) throw badRequest("rangeOrder");
  if (nightsBetween(from, to) > maxDays) throw badRequest("rangeTooLong", { max: maxDays });
};

export const maxPrice = (value) => Number(value) || Infinity;

// Language for country and city names (?lang=en)
export const lang = (params) => (hasLocale(params.get("lang")) ? params.get("lang") : DEFAULT_LOCALE);

// Stay for a return trip (trip=return&minN=2&maxN=4). Returns null for one way.
// With weekend=1, the stay is a weekend away (lib/weekend) instead of minN to maxN nights.
export const stay = (params, from, to) => {
  if (params.get("trip") !== "return") return null;
  if (params.get("weekend") === "1") {
    if (nightsBetween(from, to) < WEEKEND.stay.min) throw badRequest("stayTooShort", { min: WEEKEND.stay.min });
    return WEEKEND.stay;
  }
  const min = Number(params.get("minN"));
  const max = Number(params.get("maxN"));
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < min || max > 30) throw badRequest("stayInvalid");
  if (nightsBetween(from, to) < min) throw badRequest("stayTooShort", { min });
  return { min, max };
};

// Wraps a handler: returns JSON, 400 if the parameters are invalid, 502 if the airlines fail.
// `fn` gets the query's parameters, and the request itself (its headers)
export const handle = (fn) => {
  return async (req) => {
    try {
      const data = await fn(req.nextUrl.searchParams, req);
      return NextResponse.json(data, {
        headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=300" },
      });
    } catch (error) {
      if (error instanceof AppError) return NextResponse.json({ error: error.code, params: error.params }, { status: error.status });
      console.error(error);
      return NextResponse.json({ error: "unknown" }, { status: 502 });
    }
  };
};
