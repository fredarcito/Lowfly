// A search in the URL, so it can be shared: /es?m=everywhere&o=MLA&from=2026-11-01&to=2026-11-30&trip=return&wk=1
import { isDay, tomorrow } from "@/lib/dates";

const MODES = ["everywhere", "country", "trip"];

export function searchToParams(form, mode) {
  const p = new URLSearchParams({ m: mode, o: form.origin });
  if (mode !== "everywhere" && form.country) p.set("c", form.country);
  if (mode === "trip") {
    p.set("ida", form.ida);
    p.set("vuelta", form.vuelta);
    p.set("flex", form.flex);
    return p;
  }
  p.set("from", form.from);
  p.set("to", form.to);
  if (form.max) p.set("max", form.max);
  if (form.trip === "return") {
    p.set("trip", "return");
    if (form.weekend && mode === "everywhere") p.set("wk", "1");
    else {
      p.set("min", form.minN);
      p.set("maxn", form.maxN);
    }
  }
  return p;
}

// Back from a shared URL: { mode, fields, stale } or null if it holds no search.
// A link opened later may have past dates: the start moves to tomorrow; if the whole range (or the trip)
// is past, the dates are dropped and `stale` says not to search on its own.
export function searchFromParams(p) {
  const mode = p.get("m");
  const origin = (p.get("o") || "").toUpperCase();
  if (!MODES.includes(mode) || !/^[A-Z]{3}$/.test(origin)) return null;

  const first = tomorrow();
  const fields = { origin };
  if (mode !== "everywhere" && p.get("c")) fields.country = p.get("c");

  if (mode === "trip") {
    const [ida, vuelta] = [p.get("ida"), p.get("vuelta")];
    if (["1", "2", "3"].includes(p.get("flex"))) fields.flex = p.get("flex");
    if (!isDay(ida) || !isDay(vuelta) || ida < first || vuelta <= ida) return { mode, fields, stale: true };
    return { mode, fields: { ...fields, ida, vuelta }, stale: false };
  }

  if (/^\d+$/.test(p.get("max") || "")) fields.max = p.get("max");
  if (p.get("trip") === "return") {
    fields.trip = "return";
    if (p.get("wk") === "1") fields.weekend = true;
    else if (/^\d+$/.test(p.get("min") || "") && /^\d+$/.test(p.get("maxn") || "")) {
      fields.minN = p.get("min");
      fields.maxN = p.get("maxn");
    }
  }
  const [from, to] = [p.get("from"), p.get("to")];
  if (!isDay(from) || !isDay(to) || to < first) return { mode, fields, stale: true };
  return { mode, fields: { ...fields, from: from < first ? first : from, to }, stale: false };
}
