import GuideBrowser from "@/components/guides/GuidesPage/components/GuideBrowser";
import PlanBand from "@/components/guides/GuidesPage/components/PlanBand";
import { ENTER_RISE, riseDelay } from "@/constants/motion";

// Every city guide (/es/guias; the photo header is GuidesHero): the cards, under a search once there are enough of
// them, and the planner for any other trip. `guides`: server/cityGuides listCityGuides; `photos`: each one's, by slug.
const GuidesPage = ({ lang, guides, photos }) => (
  <div className="grid gap-10 pt-2">
    <GuideBrowser guides={guides} photos={photos} />
    <div className={ENTER_RISE} style={riseDelay(guides.length)}>
      <PlanBand lang={lang} />
    </div>
  </div>
);

export default GuidesPage;
