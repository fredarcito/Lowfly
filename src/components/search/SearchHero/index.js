"use client";

import Collapse from "@/components/shared/Collapse";
import HeroPhoto from "@/components/search/HeroPhoto";
import TopBar from "@/components/layout/TopBar";
import { useI18n } from "@/context/i18n";

// The home header: the photo, the top bar and the headline, folded away while showing results
const SearchHero = ({ collapsed }) => {
  const { texts } = useI18n();
  return (
    <header className="relative isolate overflow-hidden bg-(image:--hero) px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] sm:pt-[calc(1.75rem+env(safe-area-inset-top,0px))] pb-24 text-hero-foreground sm:px-6">
      <HeroPhoto />
      <div className="mx-auto grid max-w-5xl gap-3">
        <TopBar className="mb-4 sm:mb-6" />
        <Collapse open={!collapsed}>
          <div className="grid gap-3 pb-4">
            <p className="text-xs font-semibold tracking-wide text-hero-muted uppercase sm:text-sm">{texts.header.kicker}</p>
            <h1 className="font-heading text-[2.5rem] leading-[0.95] font-extrabold tracking-tight whitespace-pre-line drop-shadow-sm sm:text-6xl">
              {texts.header.title}
            </h1>
            <p className="max-w-[56ch] text-base text-hero-muted sm:text-lg">{texts.header.intro}</p>
          </div>
        </Collapse>
      </div>
    </header>
  );
};

export default SearchHero;
