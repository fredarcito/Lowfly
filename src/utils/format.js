import { parseDay, nightsBetween } from "@/utils/dates";
import { LOCALE_TAGS } from "@/i18n/config";

export const AIRLINES = { ryanair: "Ryanair", wizz: "Wizz Air" };

// For searching: lower case and without accents ("Málaga" → "malaga")
export const normalize = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Flag emoji from a country code ("ES" → 🇪🇸). Windows shows the two letters instead.
export const flag = (code) =>
  code ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Yellow intensity: 100 = cheapest, 15 = most expensive
export const heatOf = (price, min, max) =>
  Math.round(100 - (max === min ? 0 : (price - min) / (max - min)) * 85);

// Airlines of a fare: two if the outbound and return flights are with different airlines
export const airlinesOf = (f) => (f.ret && f.ret.airline !== f.out.airline ? [f.out.airline, f.ret.airline] : [f.airline]);
export const airlineNames = (f) => airlinesOf(f).map((a) => AIRLINES[a]).join(" + ");

// Language path on the airline websites
const SITE = {
  es: { ryanair: "es/es", wizz: "es-es" },
  en: { ryanair: "gb/en", wizz: "en-gb" },
};

// Every formatting function that depends on the language. `t` is that language's dictionary.
export const createFormat = (lang, t) => {
  const tag = LOCALE_TAGS[lang];
  const site = SITE[lang] || SITE.es;
  const dayFmt = new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric", month: "short" });
  const shortFmt = new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric" });
  const monthFmt = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric" });
  const narrowFmt = new Intl.DateTimeFormat(tag, { weekday: "narrow" });
  const p = t.phrases;

  const fmtDay = (s) => dayFmt.format(parseDay(s));
  const fmtShort = (s) => shortFmt.format(parseDay(s));
  const rangeFmt = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short" });
  const money = (v, cur = "EUR") => new Intl.NumberFormat(tag, { style: "currency", currency: cur }).format(v);
  const at = (time) => (time ? p.at(time) : "");

  // Monday to Sunday initials (5 Jan 2026 was a Monday)
  const weekdays = Array.from({ length: 7 }, (_, i) => narrowFmt.format(new Date(2026, 0, 5 + i)));

  const bookUrl = (airline, dep, arr, day, retDay) => {
    if (airline === "wizz")
      return `https://wizzair.com/${site.wizz}/booking/select-flight/${dep}/${arr}/${day}/${retDay || "null"}/1/0/0/null`;
    return (
      `https://www.ryanair.com/${site.ryanair}/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=${day}` +
      (retDay ? `&dateIn=${retDay}&isReturn=true` : "&isReturn=false") +
      `&isConnectedFlight=false&discount=0&originIata=${dep}&destinationIata=${arr}`
    );
  };

  return {
    fmtDay,
    fmtShort,
    // Flight length: "1 h 20 min" / "1h 20m"
    duration: (minutes) => t.units.duration(Math.floor(minutes / 60), minutes % 60),
    // "16–19 Oct", "30 Oct – 2 Nov"
    fmtRange: (a, b) => rangeFmt.formatRange(parseDay(a), parseDay(b)),
    fmtMonth: (s) => monthFmt.format(parseDay(s)),
    money,
    at,
    weekdays,
    bookUrl,

    // "Fri 16 Oct → Mon 19 Oct · 3 nights" or "Fri 16 Oct at 21:55"
    fareDates: (f) =>
      f.ret ? `${fmtDay(f.day)} → ${fmtDay(f.ret.day)} · ${t.units.nights(f.nights)}` : `${fmtDay(f.day)}${at(f.time)}`,

    // Weekend trip: "Fri 16 19:40 → Sun 18 21:15 · 50 h there"
    weekendDates: (f) =>
      `${fmtShort(f.day)} ${f.time} → ${fmtShort(f.ret.day)} ${f.ret.time}` +
      (f.hours ? ` · ${t.results.hoursAway(f.hours)}` : ""),

    // Booking links: a single one if it is the same airline (return booked together), otherwise outbound and return separately
    fareLinks(f, origin) {
      const r = t.results;
      if (!f.ret) return [{ label: r.bookIn(AIRLINES[f.airline]), href: bookUrl(f.airline, origin, f.code, f.day) }];
      if (f.ret.airline === f.out.airline)
        return [{ label: r.bookIn(AIRLINES[f.airline]), href: bookUrl(f.airline, origin, f.code, f.day, f.ret.day) }];
      return [
        { label: r.outIn(AIRLINES[f.out.airline]), href: bookUrl(f.out.airline, origin, f.code, f.day) },
        { label: r.retIn(AIRLINES[f.ret.airline]), href: bookUrl(f.ret.airline, f.code, origin, f.ret.day) },
      ];
    },

    // "If you leave on Thu 22 Oct and come back on Tue 27 Oct"
    changeText(c, ida, vuelta) {
      const parts = [];
      if (c.o !== ida) parts.push(p.leave(fmtDay(c.o)));
      if (c.r !== vuelta) parts.push(p.back(fmtDay(c.r)));
      return parts.length ? p.if(parts.join(p.and)) : p.sameDates;
    },

    // "you save €18.00 (+1 night)"
    deltaText(c, base) {
      if (!base) return "";
      const diff = c.total - base.total;
      const nd = nightsBetween(c.o, c.r) - nightsBetween(base.o, base.r);
      const nights = nd ? ` (${nd > 0 ? "+" : "-"}${t.units.nights(Math.abs(nd))})` : "";
      if (Math.abs(diff) < 0.5) return `${p.samePrice}${nights}`;
      return diff < 0 ? `${p.save(money(-diff))}${nights}` : `${p.payMore(money(diff))}${nights}`;
    },
  };
};
