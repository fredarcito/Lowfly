"use client";

import { Search } from "lucide-react";
import CountryFilter from "@/components/guides/GuidesPage/components/GuideBrowser/components/CountryFilter";
import LengthFilter from "@/components/guides/GuidesPage/components/GuideBrowser/components/LengthFilter";
import GuideCard from "@/components/guides/GuidesPage/components/GuideCard";
import { guideTexts } from "@/components/guides/data/texts";
import { useGuideFilters } from "@/components/guides/GuidesPage/components/GuideBrowser/hooks/useGuideFilters";
import { useI18n } from "@/context/i18n";
import { ENTER_RISE, riseDelay } from "@/constants/motion";
import { cn } from "@/utils/cn";

// From this many guides on, a search and two filters above them (with fewer, they would only be in the way). Every
// guide is in the page either way, never split into pages: search engines find them all from here.
const FILTERS_FROM = 7;

const FIELD = "h-12 w-full rounded-xl bg-card text-sm ring-1 ring-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-primary";

// Every guide as a card, under the search when there are enough of them. `guides`: server/cityGuides
// listCityGuides; `photos`: { guide's slug: its photo, or null }.
const GuideBrowser = ({ guides, photos }) => {
  const { lang } = useI18n();
  const texts = guideTexts(lang).list;
  const filters = useGuideFilters(guides, lang);
  const filtered = guides.length >= FILTERS_FROM;
  const shown = filtered ? filters.shown : guides;
  return (
    <section className="grid gap-6">
      {filtered && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
          <label className="relative">
            <span className="sr-only">{texts.search}</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => filters.setQuery(event.target.value)}
              placeholder={texts.search}
              className={cn(FIELD, "pr-4 pl-11 placeholder:text-muted-foreground")}
            />
          </label>
          <CountryFilter countries={filters.countries} value={filters.country} onChange={filters.setCountry} texts={texts} />
          <LengthFilter dayCounts={filters.dayCounts} value={filters.dayCount} onChange={filters.setDayCount} texts={texts} />
        </div>
      )}
      <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{texts.explore}</h2>
      {shown.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((guide, index) => (
            <li key={guide.slug} className={ENTER_RISE} style={riseDelay(index)}>
              <GuideCard guide={guide} photo={photos[guide.slug]} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-card p-5 text-muted-foreground ring-1 ring-foreground/10">{texts.none}</p>
      )}
    </section>
  );
};

export default GuideBrowser;
