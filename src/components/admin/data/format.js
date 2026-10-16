// How the admin pages write figures and dates, in the page's language (amounts in dollars, as the AI is billed)
import { LOCALE_TAGS } from "@/i18n/config";

// The team works on Spain's time
const ZONE = "Europe/Madrid";
const formats = {};

const makeFormat = (lang) => {
  const tag = LOCALE_TAGS[lang] ?? LOCALE_TAGS.es;
  const dollars = new Intl.NumberFormat(tag, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cents = new Intl.NumberFormat(tag, { style: "currency", currency: "USD", minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const whole = new Intl.NumberFormat(tag);
  const percent = new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 0 });
  const longDay = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric", timeZone: ZONE });
  const dayTime = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: ZONE });
  const shortDay = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", timeZone: "UTC" });
  return {
    // Under a dollar, four decimals (an itinerary costs fractions of a cent); nothing spent, plainly 0.00
    money: (amount) => (amount > 0 && amount < 1 ? cents : dollars).format(amount),
    count: (amount) => whole.format(amount),
    percent: (share) => percent.format(share),
    // A day ("2026-10-16"): "16 oct"
    day: (day) => shortDay.format(new Date(`${day}T00:00:00Z`)),
    // A moment (an ISO date and time): "16 oct 2026", or "16 oct, 14:05" with `time`
    date: (moment, time = false) => (moment ? (time ? dayTime : longDay).format(new Date(moment)) : "—"),
  };
};

// The formats for `lang`, made once per language
export const adminFormat = (lang) => (formats[lang] ??= makeFormat(lang));
