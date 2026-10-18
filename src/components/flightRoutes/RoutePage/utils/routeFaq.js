import { routeTexts } from "@/components/flightRoutes/data/texts";
import { getDictionary, LOCALE_TAGS } from "@/i18n";
import { AIRLINES, capitalize, createFormat } from "@/utils/format";
import { ROUTES } from "@/constants/routes";

// The months shown after the cheapest one in its answer
const NEXT_MONTHS = 2;

// What people ask about a route, answered with its own figures, so every route's page has words of its own:
// [{ id, question, answer, link? }] (link: { href, label }). Only the questions its data can answer. The page shows
// them (RouteFaq) and gives search engines the same ones (FAQPage), so both always say the same.
// route: server/flightRoutes/routes; prices: server/flightRoutes/prices (or null); airlines: their names, joined;
// duration: written (or null); guide: server/guides (or null).
export const routeFaq = ({ lang, route, prices, airlines, duration, guide }) => {
  const texts = routeTexts(lang).faq;
  const format = createFormat(lang, getDictionary(lang));
  const tag = LOCALE_TAGS[lang];
  const money = (amount) => format.money(amount, "EUR");
  const list = (items) => new Intl.ListFormat(tag, { style: "long", type: "conjunction" }).format(items);
  const dayName = (day) => new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
  const monthName = (month) => new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-15T12:00:00Z`));
  const { origin } = route;
  const airlineCount = prices?.airlines.length ?? new Set(route.airports.flatMap((airport) => airport.airlines)).size;
  const faq = [];

  if (prices) {
    const { cheapest } = prices;
    faq.push({
      id: "price",
      question: texts.price.question(origin.city, route.city),
      answer: texts.price.answer(money(cheapest.price), AIRLINES[cheapest.airline] ?? cheapest.airline, dayName(cheapest.day)),
    });
    const byPrice = [...prices.months].sort((first, second) => first.fare.price - second.fare.price);
    const next = byPrice.slice(1, 1 + NEXT_MONTHS).map((entry) => [monthName(entry.month), money(entry.fare.price)]);
    faq.push({
      id: "month",
      question: texts.month.question(origin.city, route.city),
      answer: texts.month.answer(capitalize(monthName(byPrice[0].month)), money(byPrice[0].fare.price), next),
    });
  }
  faq.push({ id: "airlines", question: texts.airlines.question(origin.city, route.city), answer: texts.airlines.answer(airlines, airlineCount) });
  if (duration) faq.push({ id: "duration", question: texts.duration.question(origin.city, route.city), answer: texts.duration.answer(duration) });
  if (route.airports.length > 1) {
    const names = route.airports.map((airport) => (airport.name ? `${airport.name} (${airport.code})` : airport.code));
    faq.push({ id: "airports", question: texts.airports.question(origin.city, route.city), answer: texts.airports.answer(capitalize(list(names)), route.city) });
  }
  const highlights = guide?.tags?.length ? capitalize(list(guide.tags)) : null;
  faq.push({
    id: "plan",
    question: texts.plan.question(route.city),
    answer: texts.plan.answer(route.city, highlights),
    link: { href: ROUTES.newTrip(lang, route.airports[0].code), label: texts.plan.link },
  });
  return faq;
};

// The same questions for search engines (schema.org FAQPage), answers as plain text
export const faqPageOf = (faq) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((entry) => ({ "@type": "Question", name: entry.question, acceptedAnswer: { "@type": "Answer", text: entry.answer } })),
});
