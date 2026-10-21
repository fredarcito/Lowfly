import GuideDay from "@/components/guides/GuidePage/components/GuideDay";
import GuideDayNav from "@/components/guides/GuidePage/components/GuideDayNav";
import GuideFaq from "@/components/guides/GuidePage/components/GuideFaq";
import GuideIntro from "@/components/guides/GuidePage/components/GuideIntro";
import TailorCard from "@/components/guides/GuidePage/components/TailorCard";
import TailorPrompt from "@/components/guides/GuidePage/components/TailorPrompt";
import RouteLink from "@/components/multiCity/RouteLink";
import { guideTexts } from "@/components/guides/data/texts";
import { ENTER_RISE, riseDelay } from "@/constants/motion";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

// A city guide's body (/es/guias/roma-3-dias; the photo header is GuideHero), rendered on the server for search
// engines: what to know, the multi-city routes the city is in (a quiet link each, so the reader knows where this guide
// fits before the days), the days' links, then the days, each one ending with a question only the reader's own
// itinerary answers, then what people ask about the city, and at the end what that itinerary brings. Every coloured
// way out goes to the planner with the city already chosen.
// `guide`: server/cityGuides getCityGuide; `faq`: utils/guideFaq; `routes`: server/multiCity/pages routePagesWithGuide.
const GuidePage = ({ lang, guide, faq, routes = [] }) => {
  const allTexts = guideTexts(lang);
  const texts = allTexts.prompts;
  const href = ROUTES.newTrip(lang, guide.codes[0]);
  const { days } = guide.itinerary;
  const firstStart = days[0]?.stops[0]?.time?.match(/\d{1,2}:\d{2}/)?.[0] ?? "9:00";
  // After which day each prompt shows (a short guide keeps only the last one)
  const promptAfter = (index) => {
    if (index === days.length - 1) return { spot: "afterLastDay", prompt: { ...texts.afterLastDay, title: texts.afterLastDay.title(days.length) } };
    // When the guide's first day starts ("08:30"), which the reader's own may not
    if (index === 0) return { spot: "afterFirstDay", prompt: { ...texts.afterFirstDay, text: texts.afterFirstDay.text(firstStart) } };
    if (index === 1) return { spot: "afterSecondDay", prompt: texts.afterSecondDay };
    return null;
  };

  return (
    <article className="grid gap-10">
      <GuideIntro lang={lang} city={guide.city} intro={guide.intro} />
      {/* The routes the city is in, right after what to know: the reader knows where this guide fits before the days.
          A note, so it sits closer to the cards above than to the days below */}
      {routes.length > 0 && (
        <div className="-mt-4 grid gap-3">
          {routes.map((route) => (
            <RouteLink key={route.id} lang={lang} city={guide.city} route={route} />
          ))}
        </div>
      )}
      {/* After the four cards of what to know */}
      <div className={cn("grid gap-10", ENTER_RISE)} style={riseDelay(4)}>
        <GuideDayNav
          days={days.map((day, index) => ({ id: day.date, name: allTexts.day(index + 1), title: day.title }))}
          label={allTexts.days}
        />
        {days.map((day, index) => {
          const after = promptAfter(index);
          return (
            <GuideDay key={day.date} lang={lang} day={day} number={index + 1}>
              {after && <TailorPrompt prompt={after.prompt} href={href} guide={guide.id} spot={after.spot} />}
            </GuideDay>
          );
        })}
      </div>
      <GuideFaq lang={lang} city={guide.city} faq={faq} />
      <TailorCard lang={lang} city={guide.city} href={href} guide={guide.id} />
    </article>
  );
};

export default GuidePage;
