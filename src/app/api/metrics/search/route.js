import { NextResponse } from "next/server";
import { countMetric } from "@/server/metrics";
import { allow } from "@/server/rateLimit";
import { SEARCH_ERRORS, SEARCH_MODES } from "@/constants/metrics";

// Searches a visitor may report a minute (a person searches a few times; more is not a person)
const PER_MINUTE = 30;

// POST /api/metrics/search { mode, outcome, customDates } → counts a search for the admin's "Uso" page
// (server/metrics): its kind, how it ended ("results", "empty" or an error code) and, searching a range of dates,
// whether they were changed from the form's. Reported by the browser once the search ends: the CDN answers some
// searches without reaching the server, so the server alone would miss them. Only known values are counted, and only
// PER_MINUTE a visitor; the answer is always "no content", counted or not (nothing for the page to show or log).
const NOTHING = () => new NextResponse(null, { status: 204 });

export const POST = async (request) => {
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(`metrics:${visitor}`, PER_MINUTE, 60_000)) return NOTHING();
  const { mode, outcome, customDates } = await request.json().catch(() => ({}));
  if (!SEARCH_MODES.includes(mode)) return NOTHING();
  const ended = ["results", "empty"].includes(outcome) ? outcome : `fail:${SEARCH_ERRORS.includes(outcome) ? outcome : "unknown"}`;
  countMetric(`search:${mode}`);
  countMetric(`search:${mode}:${ended}`);
  if (customDates === true) countMetric(`search:${mode}:custom`);
  return NOTHING();
};
