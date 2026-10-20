"use client";

import { useState } from "react";
import TownChain from "@/components/shared/TownChain";
import { routePageTexts } from "@/components/multiCity/data/texts";
import { cn } from "@/utils/cn";
import { RECOMMENDED_VERSION } from "@/constants/multiCity";

// The lengths a route comes in (short, full, long), as the quiet segmented control of the search's cards, and the
// picked one's towns with their nights and the way between them (TownChain). Every version's chain is in the page,
// the others hidden, so search engines read them all. `versions`: server/multiCity/pages.
const RouteVersions = ({ lang, versions }) => {
  const texts = routePageTexts(lang).versions;
  const [picked, setPicked] = useState(versions.some((version) => version.version === RECOMMENDED_VERSION) ? RECOMMENDED_VERSION : versions[0].version);
  return (
    <section aria-labelledby="route-versions-title" className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="route-versions-title" className="font-heading text-xl font-bold">
          {texts.title}
        </h2>
        <div role="radiogroup" aria-label={texts.aria} className="inline-flex w-fit rounded-lg bg-muted p-0.5">
          {versions.map((version) => {
            const checked = version.version === picked;
            return (
              <button
                key={version.version}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => setPicked(version.version)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  checked ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {texts.names[version.version]}
              </button>
            );
          })}
        </div>
      </div>
      {versions.map((version) => (
        <div key={version.version} hidden={version.version !== picked} className="grid gap-2">
          <p className="text-sm font-semibold">
            {texts.days(version.days.min, version.days.ideal)}
            {version.version === RECOMMENDED_VERSION && <span className="font-normal text-muted-foreground"> · {texts.recommended}</span>}
          </p>
          <TownChain towns={version.towns.map((town) => ({ ...town, ref: town.key }))} />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">{texts.landNote}</p>
    </section>
  );
};

export default RouteVersions;
