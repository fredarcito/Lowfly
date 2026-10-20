import { Route } from "lucide-react";
import PhotoBackdrop from "@/components/shared/PhotoBackdrop";
import ShareButton from "@/components/shared/ShareButton";
import RouteSearchLink from "@/components/multiCity/RoutePage/components/RouteSearchLink";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { ROUTES } from "@/constants/routes";
import { LOCALE_TAGS } from "@/i18n";

// The top of a route's page, over the route's photo (as a guide's): how long it is, its title, when it was written,
// what it is like, the way to the search and "Share". `page`: server/multiCity/pages getRoutePage.
const RouteHero = ({ lang, page }) => {
  const texts = routePageTexts(lang);
  const written = new Intl.DateTimeFormat(LOCALE_TAGS[lang], { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(page.writtenAt));
  return (
    <div className="grid gap-4 pt-4 pb-2 sm:pt-2 sm:pb-6">
      {page.photo && <PhotoBackdrop image={page.photo} photo={page.photo} alt={texts.photoAlt(page.name)} />}
      <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-hero-muted uppercase">
        <Route className="size-4" /> {texts.kicker(page.days.min, page.days.max)}
      </p>
      <h1 className="max-w-[18ch] font-heading text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">{page.title}</h1>
      <p className="text-sm text-hero-muted">{texts.updated(written)}</p>
      <p className="max-w-[60ch] text-hero-muted sm:text-lg">{page.summary}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <RouteSearchLink href={ROUTES.search(lang, "multiCity")} route={page.id} spot="hero" className="h-12 w-fit px-6 text-base font-bold">
          {texts.search}
        </RouteSearchLink>
        <ShareButton
          path={ROUTES.multiCityRoute(lang, page.slug)}
          title={texts.share.title}
          description={texts.share.text}
          message={page.title}
          analytics={{ content_type: "multi_city_route", item_id: page.id }}
          className="h-12 px-5 text-base"
        />
      </div>
    </div>
  );
};

export default RouteHero;
