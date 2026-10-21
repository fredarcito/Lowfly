import FaqSection from "@/components/shared/FaqSection";
import RouteTips from "@/components/multiCity/RoutePage/components/RouteTips";
import RouteSearchCard from "@/components/multiCity/RoutePage/components/RouteSearchCard";
import RouteTown from "@/components/multiCity/RoutePage/components/RouteTown";
import RouteVersions from "@/components/multiCity/RoutePage/components/RouteVersions";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { ENTER_RISE, riseDelay } from "@/constants/motion";
import { cn } from "@/utils/cn";

// A multi-city route's page body (/es/recorridos/classic-italy; the photo header is RouteHero), rendered on the
// server for search engines, in the guides' look: why this route, its lengths, each town (what it is like, what to
// see, a tip, its guide), getting between them and when to go, what people ask, and at the end the way to the
// "Recorridos" search. No day by day and no prices: that is the search's and the reader's own itinerary's.
// `page`: server/multiCity/pages getRoutePage.
const RoutePage = ({ lang, page }) => {
  const texts = routePageTexts(lang);
  return (
    <article className="grid gap-10">
      <section aria-labelledby="route-why-title" className={cn("grid gap-3", ENTER_RISE)}>
        <h2 id="route-why-title" className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          {texts.why}
        </h2>
        {page.why.map((paragraph) => (
          <p key={paragraph} className="max-w-[70ch] leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </section>
      <div className={ENTER_RISE} style={riseDelay(1)}>
        <RouteVersions lang={lang} versions={page.versions} />
      </div>
      <section aria-labelledby="route-towns-title" className="grid gap-6">
        <h2 id="route-towns-title" className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          {texts.towns}
        </h2>
        {/* The towns on the route's line, in order, with the way by land between them */}
        <ol className="grid">
          {page.towns.map((town, index) => (
            <RouteTown key={town.id} lang={lang} town={town} number={index + 1} versionCount={page.versions.length} />
          ))}
        </ol>
      </section>
      <RouteTips lang={lang} gettingAround={page.gettingAround} bestTime={page.bestTime} />
      <FaqSection id="route-faq-title" title={texts.faq} faq={page.faq} />
      <RouteSearchCard lang={lang} route={page.id} />
    </article>
  );
};

export default RoutePage;
