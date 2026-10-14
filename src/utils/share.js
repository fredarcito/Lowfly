// A search in the URL, so it can be shared: /es?m=everywhere&o=MLA&from=2026-11-01&to=2026-11-30&trip=return&wk=1
import { isDay, tomorrow } from "@/utils/dates";

const MODES = ["everywhere", "country", "trip"];

export function searchToParams(form, mode) {
  const params = new URLSearchParams({ m: mode, o: form.origin });
  if (mode !== "everywhere" && form.country) params.set("c", form.country);
  if (mode === "trip") {
    params.set("ida", form.ida);
    params.set("vuelta", form.vuelta);
    params.set("flex", form.flex);
    return params;
  }
  params.set("from", form.from);
  params.set("to", form.to);
  if (form.max) params.set("max", form.max);
  if (form.trip === "return") {
    params.set("trip", "return");
    if (form.weekend && mode === "everywhere") params.set("wk", "1");
    else {
      params.set("min", form.minN);
      params.set("maxn", form.maxN);
    }
  }
  return params;
}

// Back from a shared URL: { mode, fields, stale } or null if it holds no search.
// A link opened later may have past dates: the start moves to tomorrow; if the whole range (or the trip)
// is past, the dates are dropped and `stale` says not to search on its own.
export function searchFromParams(params) {
  const mode = params.get("m");
  const origin = (params.get("o") || "").toUpperCase();
  if (!MODES.includes(mode) || !/^[A-Z]{3}$/.test(origin)) return null;

  const first = tomorrow();
  const fields = { origin };
  if (mode !== "everywhere" && params.get("c")) fields.country = params.get("c");

  if (mode === "trip") {
    const [ida, vuelta] = [params.get("ida"), params.get("vuelta")];
    if (["1", "2", "3"].includes(params.get("flex"))) fields.flex = params.get("flex");
    if (!isDay(ida) || !isDay(vuelta) || ida < first || vuelta <= ida) return { mode, fields, stale: true };
    return { mode, fields: { ...fields, ida, vuelta }, stale: false };
  }

  if (/^\d+$/.test(params.get("max") || "")) fields.max = params.get("max");
  if (params.get("trip") === "return") {
    fields.trip = "return";
    if (params.get("wk") === "1") fields.weekend = true;
    else if (/^\d+$/.test(params.get("min") || "") && /^\d+$/.test(params.get("maxn") || "")) {
      fields.minN = params.get("min");
      fields.maxN = params.get("maxn");
    }
  }
  const [from, to] = [params.get("from"), params.get("to")];
  if (!isDay(from) || !isDay(to) || to < first) return { mode, fields, stale: true };
  return { mode, fields: { ...fields, from: from < first ? first : from, to }, stale: false };
}
