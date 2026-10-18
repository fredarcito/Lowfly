import { guideTexts } from "@/components/guides/data/texts";
import { LOCALE_TAGS } from "@/i18n";

// What people ask about a city, answered with its guide (no AI: its days, its introduction and its must-sees), so
// every guide's page has words of its own: [{ id, question, answer }]. Only the questions it can answer. The page
// shows them (GuideFaq) and gives search engines the same ones (FAQPage), so both always say the same.
// `guide`: server/cityGuides getCityGuide.
export const guideFaq = (lang, guide) => {
  const texts = guideTexts(lang).faq;
  const { city, intro } = guide;
  const { days } = guide.itinerary;
  const list = (items) => new Intl.ListFormat(LOCALE_TAGS[lang], { style: "long", type: "conjunction" }).format(items);
  const plan = days.map((day, index) => texts.days.plan(index + 1, day.title)).join(" ");
  const mustSee = [...new Set(days.flatMap((day) => day.stops.filter((stop) => stop.type === "imprescindible").map((stop) => stop.title)))];
  const faq = [
    { id: "days", question: texts.days.question(city), answer: texts.days.answer(city, days.length, plan) },
    { id: "stay", question: texts.stay(city), answer: intro.stay },
    { id: "gettingAround", question: texts.gettingAround(city), answer: intro.gettingAround },
    { id: "bestTime", question: texts.bestTime(city), answer: intro.bestTime },
    mustSee.length > 0 && { id: "mustSee", question: texts.mustSee.question(city), answer: texts.mustSee.answer(list(mustSee)) },
  ];
  return faq.filter((entry) => entry && entry.answer);
};
