import { Fragment } from "react";
import GuideDay from "@/components/guides/GuidePage/components/GuideDay";
import GuideIntro from "@/components/guides/GuidePage/components/GuideIntro";
import TailorCard from "@/components/guides/GuidePage/components/TailorCard";
import TailorPrompt from "@/components/guides/GuidePage/components/TailorPrompt";
import { guideTexts } from "@/components/guides/data/texts";
import { ROUTES } from "@/constants/routes";

// A city guide's body (/es/guides/rome-3-days; the photo header is GuideHero), rendered on the server for search
// engines: what to know, then the days, each one followed by a question only the reader's own itinerary answers,
// and at the end what that itinerary brings. Every way out goes to the planner with the city already chosen.
// `guide`: server/cityGuides getCityGuide.
const GuidePage = ({ lang, guide }) => {
  const texts = guideTexts(lang).prompts;
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
      {days.map((day, index) => {
        const after = promptAfter(index);
        return (
          <Fragment key={day.date}>
            <GuideDay lang={lang} day={day} number={index + 1} />
            {after && <TailorPrompt prompt={after.prompt} href={href} guide={guide.slug} spot={after.spot} />}
          </Fragment>
        );
      })}
      <TailorCard lang={lang} city={guide.city} href={href} guide={guide.slug} />
    </article>
  );
};

export default GuidePage;
