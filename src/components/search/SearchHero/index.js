"use client";

import Collapse from "@/components/shared/Collapse";
import HeroPhoto from "@/components/search/HeroPhoto";
import TopBar from "@/components/layout/TopBar";
import { useI18n } from "@/context/i18n";

// The search pages' header: the photo, the top bar and the headline, folded away while showing results. A kind of
// search's own page (`mode`) has its own headline and intro, but "anywhere": it is what the home searches, so it keeps
// the home's (the same form never shows two headlines).
const SearchHero = ({ collapsed, mode }) => {
  const { texts } = useI18n();
  const ownWords = mode && mode !== "everywhere";
  const words = ownWords ? texts.searchPages[mode] : texts.header;
  return (
    <header className="relative isolate overflow-hidden bg-(image:--hero) px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:pt-[calc(1.75rem+env(safe-area-inset-top,0px))] pb-24 text-hero-foreground sm:px-6">
      <HeroPhoto />
      <div className="mx-auto grid max-w-5xl gap-3">
        <TopBar className="mb-4 sm:mb-6" />
        <Collapse open={!collapsed}>
          <div className="grid gap-3 pb-1 sm:pb-4">
            <p className="text-xs font-semibold tracking-wide text-hero-muted uppercase sm:text-sm">{texts.header.kicker}</p>
            <h1 className="font-heading text-[2rem] leading-[0.95] font-extrabold tracking-tight whitespace-pre-line drop-shadow-sm sm:text-6xl">
              {ownWords ? words.heading : words.title}
            </h1>
            {/* Phones: the short version, so the form starts higher up (clear of the photo credit button on the right) */}
            <p className="max-w-[56ch] text-base text-hero-muted sm:text-lg">
              <span className="block pr-7 sm:hidden">{words.introShort}</span>
              <span className="max-sm:hidden">{words.intro}</span>
            </p>
          </div>
        </Collapse>
      </div>
    </header>
  );
};

export default SearchHero;
