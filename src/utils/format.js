import { parseDay, nightsBetween } from "@/utils/dates";
import { LOCALE_TAGS } from "@/i18n/config";
import { MORE_AIRLINES } from "@/constants/airlines";

export const AIRLINES = {
  ryanair: "Ryanair",
  wizz: "Wizz Air",
  ...Object.fromEntries(Object.entries(MORE_AIRLINES).map(([id, airline]) => [id, airline.name])),
};

// A fare whose price was seen in recent searches (more airlines), not checked live: the airline confirms it
export const isCachedFare = (fare) => Boolean(fare.cached || fare.out?.cached || fare.ret?.cached || fare.legs?.some((leg) => leg.cached));

// For searching: lower case and without accents ("Málaga" → "malaga")
export const normalize = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Flag emoji from a country code ("ES" → 🇪🇸). Windows shows the two letters instead.
export const flag = (code) =>
  code ? String.fromCodePoint(...[...code.toUpperCase()].map((letter) => 0x1f1a5 + letter.charCodeAt(0))) : "";

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Yellow intensity: 100 = cheapest, 15 = most expensive
export const heatOf = (price, min, max) =>
  Math.round(100 - (max === min ? 0 : (price - min) / (max - min)) * 85);

// Airlines of a fare: two if the outbound and return flights are with different airlines
// The fare's airlines: every one of a trip through a hub (`legs`), both of a return trip with two
export const airlinesOf = (fare) => {
  if (fare.legs) return [...new Set(fare.legs.map((leg) => leg.airline))];
  return fare.ret && fare.ret.airline !== fare.out.airline ? [fare.out.airline, fare.ret.airline] : [fare.airline];
};
export const airlineNames = (fare) => airlinesOf(fare).map((airline) => AIRLINES[airline]).join(" + ");

// Language path on the airline websites
const SITE = {
  es: { ryanair: "es/es", wizz: "es-es" },
  en: { ryanair: "gb/en", wizz: "en-gb" },
};

// Every formatting function that depends on the language. `texts` is that language's dictionary. `passengers`: the
// adults the search is for (a saved trip's, its own): the booking links ask the airline for them and `total` /
// `adultsLabel` say what a fare's price (always per person) comes to.
export const createFormat = (lang, texts, passengers = 1) => {
  const tag = LOCALE_TAGS[lang];
  const site = SITE[lang] || SITE.es;
  const dayFmt = new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric", month: "short" });
  const shortFmt = new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric" });
  const monthFmt = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric" });
  const narrowFmt = new Intl.DateTimeFormat(tag, { weekday: "narrow" });
  const phrases = texts.phrases;

  const fmtDay = (day) => dayFmt.format(parseDay(day));
  const fmtShort = (day) => shortFmt.format(parseDay(day));
  const rangeFmt = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short" });
  // `options`: more Intl.NumberFormat options (whole euros: { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const money = (amount, cur = "EUR", options) => new Intl.NumberFormat(tag, { style: "currency", currency: cur, ...options }).format(amount);
  const at = (time) => (time ? phrases.at(time) : "");

  // Monday to Sunday initials (5 Jan 2026 was a Monday)
  const weekdays = Array.from({ length: 7 }, (_, weekday) => narrowFmt.format(new Date(2026, 0, 5 + weekday)));

  const bookUrl = (airline, dep, arr, day, retDay) => {
    // More airlines: that flight's search on their site when we know how to ask, else their home page
    const other = MORE_AIRLINES[airline];
    if (other) return other.deeplink ? other.deeplink({ lang, dep, arr, day, retDay, passengers }) : other.home;
    if (airline === "wizz")
      return `https://wizzair.com/${site.wizz}/booking/select-flight/${dep}/${arr}/${day}/${retDay || "null"}/${passengers}/0/0/null`;
    return (
      `https://www.ryanair.com/${site.ryanair}/trip/flights/select?adults=${passengers}&teens=0&children=0&infants=0&dateOut=${day}` +
      (retDay ? `&dateIn=${retDay}&isReturn=true` : "&isReturn=false") +
      `&isConnectedFlight=false&discount=0&originIata=${dep}&destinationIata=${arr}`
    );
  };

  return {
    passengers,
    // Who a price is for: "1 adulto", "3 adultos"
    adultsLabel: passengers > 1 ? texts.form.adultsCount(passengers) : texts.results.oneAdult,
    // A fare's price (always per person) for every adult: the one the highlighted results show
    forGroup: (price) => price * passengers,
    // "29,98 € por persona", under the group's price (nothing for one adult)
    perPerson: (price, cur = "EUR") => (passengers > 1 ? texts.results.perPersonPrice(money(price, cur)) : ""),
    fmtDay,
    fmtShort,
    // Flight length: "1 h 20 min" / "1h 20m"
    duration: (minutes) => texts.units.duration(Math.floor(minutes / 60), minutes % 60),
    // "16–19 Oct", "30 Oct – 2 Nov"
    fmtRange: (first, last) => rangeFmt.formatRange(parseDay(first), parseDay(last)),
    fmtMonth: (day) => monthFmt.format(parseDay(day)),
    money,
    at,
    weekdays,
    bookUrl,

    // "Fri 16 Oct → Mon 19 Oct · 3 nights" or "Fri 16 Oct at 21:55"
    fareDates: (fare) =>
      fare.ret ? `${fmtDay(fare.day)} → ${fmtDay(fare.ret.day)} · ${texts.units.nights(fare.nights)}` : `${fmtDay(fare.day)}${at(fare.time)}`,

    // Weekend trip: "Fri 16 19:40 → Sun 18 21:15 · 50 h there"
    weekendDates: (fare) =>
      `${fmtShort(fare.day)} ${fare.time} → ${fmtShort(fare.ret.day)} ${fare.ret.time}` +
      (fare.hours ? ` · ${texts.results.hoursAway(fare.hours)}` : ""),

    // Booking links: a single one if it is the same airline (return booked together), otherwise outbound and return separately
    fareLinks(fare, origin) {
      const results = texts.results;
      if (!fare.ret) return [{ label: results.bookIn(AIRLINES[fare.airline]), href: bookUrl(fare.airline, origin, fare.code, fare.day) }];
      if (fare.ret.airline === fare.out.airline)
        return [{ label: results.bookIn(AIRLINES[fare.airline]), href: bookUrl(fare.airline, origin, fare.code, fare.day, fare.ret.day) }];
      return [
        { label: results.outIn(AIRLINES[fare.out.airline]), href: bookUrl(fare.out.airline, origin, fare.code, fare.day) },
        { label: results.retIn(AIRLINES[fare.ret.airline]), href: bookUrl(fare.ret.airline, fare.code, origin, fare.ret.day) },
      ];
    },

    // A trip through a hub (server/stopovers): every flight is its own ticket, so one link per flight
    legLinks(legs) {
      return legs.map((leg) => ({
        label: texts.results.legIn(leg.from, leg.to, AIRLINES[leg.airline]),
        href: bookUrl(leg.airline, leg.from, leg.to, leg.day),
      }));
    },

    // "If you leave on Thu 22 Oct and come back on Tue 27 Oct"
    changeText(combo, ida, vuelta) {
      const parts = [];
      if (combo.o !== ida) parts.push(phrases.leave(fmtDay(combo.o)));
      if (combo.r !== vuelta) parts.push(phrases.back(fmtDay(combo.r)));
      return parts.length ? phrases.if(parts.join(phrases.and)) : phrases.sameDates;
    },

    // "you save €18.00 (+1 night)"
    deltaText(combo, base) {
      if (!base) return "";
      const diff = combo.total - base.total;
      const nd = nightsBetween(combo.o, combo.r) - nightsBetween(base.o, base.r);
      const nights = nd ? ` (${nd > 0 ? "+" : "-"}${texts.units.nights(Math.abs(nd))})` : "";
      if (Math.abs(diff) < 0.5) return `${phrases.samePrice}${nights}`;
      return diff < 0 ? `${phrases.save(money(-diff))}${nights}` : `${phrases.payMore(money(diff))}${nights}`;
    },
  };
};
