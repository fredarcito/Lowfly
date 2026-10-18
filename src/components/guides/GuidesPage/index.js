import GuideBrowser from "@/components/guides/GuidesPage/components/GuideBrowser";
import PlanBand from "@/components/guides/GuidesPage/components/PlanBand";

// Every city guide (/es/guides; the photo header is GuidesHero): the cards, under a search once there are enough of
// them, and the planner for any other trip. `guides`: server/cityGuides listCityGuides; `photos`: each one's, by slug.
const GuidesPage = ({ lang, guides, photos }) => (
  <div className="grid gap-10 pt-2">
    <GuideBrowser guides={guides} photos={photos} />
    <PlanBand lang={lang} />
  </div>
);

export default GuidesPage;
