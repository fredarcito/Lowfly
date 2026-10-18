import GuideDay from "@/components/guides/GuidePage/components/GuideDay";
import GuideDayNav from "@/components/guides/GuidePage/components/GuideDayNav";
import GuideIntro from "@/components/guides/GuidePage/components/GuideIntro";
import TailorCard from "@/components/guides/GuidePage/components/TailorCard";
import TailorPrompt from "@/components/guides/GuidePage/components/TailorPrompt";
import { guideTexts } from "@/components/guides/data/texts";
import { ROUTES } from "@/constants/routes";

// A city guide's body (/es/guides/rome-3-days; the photo header is GuideHero), rendered on the server for search
// engines: what to know, the days' links, then the days, each one ending with a question only the reader's own itinerary answers,
// and at the end what that itinerary brings. Every way out goes to the planner with the city already chosen.
// `guide`: server/cityGuides getCityGuide.
const GuidePage = ({ lang, guide }) => {
  const allTexts = guideTexts(lang);
  const texts = allTexts.prompts;
  const href = ROUTES.newTrip(lang, guide.codes[0]);
  const { days } = guide.itinerary;
  // After which day each prompt shows (a short guide keeps only the last one)
  const promptAfter = (index) => {
    if (index === days.length - 1) return { spot: "afterLastDay", prompt: { ...texts.afterLastDay, title: texts.afterLastDay.title(days.length) } };
    if (index === 0) return { spot: "afterFirstDay", prompt: texts.afterFirstDay };
    if (index === 1) return { spot: "afterSecondDay", prompt: texts.afterSecondDay };
    return null;
  };

  return (
    <article className="grid gap-10">
      <GuideIntro lang={lang} city={guide.city} intro={guide.intro} />
      <div className="grid gap-10">
        <GuideDayNav
          days={days.map((day, index) => ({ id: day.date, name: allTexts.day(index + 1), title: day.title }))}
          label={allTexts.days}
        />
        {days.map((day, index) => {
          const after = promptAfter(index);
          return (
            <GuideDay key={day.date} lang={lang} day={day} number={index + 1}>
              {after && <TailorPrompt prompt={after.prompt} href={href} guide={guide.slug} spot={after.spot} />}
            </GuideDay>
          );
        })}
      </div>
      <TailorCard lang={lang} city={guide.city} href={href} guide={guide.slug} />
    </article>
  );
};

export default GuidePage;
