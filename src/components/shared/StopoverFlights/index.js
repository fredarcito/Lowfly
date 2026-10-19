"use client";

import { Fragment } from "react";
import { ChevronDown, ExternalLink, List, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/button";
import BagEstimate from "@/components/shared/BagEstimate";
import Collapse from "@/components/shared/Collapse";
import FlightLeg from "@/components/shared/FlightLeg";
import StopLine from "@/components/shared/StopLine";
import { useI18n } from "@/context/i18n";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useLegEnds } from "@/hooks/useLegEnds";
import { cn } from "@/utils/cn";
import { AIRLINES } from "@/utils/format";

// Every flight of a trip through a hub with its own "Buy" (separate tickets), what happens between them,
// `ticketsNote` (that the connections are up to you) and the baggage estimate folded under it, with `action` on the
// same line (an opened result's "Save trip"; under it on phones)
const StopoverFlights = ({ trip, ticketsNote, action }) => {
  const { texts, format } = useI18n();
  const ends = useLegEnds(trip.legs);
  const bags = useDisclosure();
  const links = format.legLinks(trip.legs);
  const arrival = trip.legs.findIndex((leg) => leg.to === trip.code);
  const results = texts.results;

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h3 className="flex items-center gap-2.5 font-heading text-xl font-bold">
          <List className="size-5 text-muted-foreground" />
          {results.yourFlights(trip.legs.length)}
        </h3>
        <p className="text-sm text-muted-foreground">{results.buyDirect}</p>
      </div>

      <div className="grid gap-6">
        {trip.legs.map((leg, index) => {
          const back = index > arrival;
          // The way's name only on its first flight
          const firstOfWay = index === 0 || index === arrival + 1;
          const stop = trip.stops[index - 1];
          return (
            <Fragment key={`${leg.from}-${leg.to}-${leg.day}`}>
              {index > 0 &&
                (index === arrival + 1 ? (
                  <div className="h-px bg-border" />
                ) : (
                  <StopLine stop={stop} />
                ))}
              <FlightLeg
                icon={firstOfWay ? (back ? PlaneLanding : PlaneTakeoff) : undefined}
                label={firstOfWay ? (back ? results.ret : results.out) : undefined}
                flight={leg}
                from={ends[index].from}
                to={ends[index].to}
                action={
                  <Button asChild variant="outline" className="h-9 border-primary/70 bg-transparent px-4 font-medium text-primary-ink hover:border-primary hover:bg-primary/10 hover:text-primary-ink sm:w-full dark:border-primary/70 dark:bg-transparent dark:hover:border-primary dark:hover:bg-primary/10">
                    <a href={links[index].href} target="_blank" rel="noopener noreferrer" aria-label={links[index].label}>
                      {results.buyIn(AIRLINES[leg.airline])}
                      <ExternalLink />
                    </a>
                  </Button>
                }
              />
            </Fragment>
          );
        })}
      </div>

      {ticketsNote}

      <div className="grid gap-3 border-t pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={bags.toggle}
            aria-expanded={bags.open}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
          >
            {bags.open ? results.hideBags : results.showBags}
            <ChevronDown className={cn("size-4 transition-transform", bags.open && "rotate-180")} />
          </button>
          {action && <div className="max-sm:w-full">{action}</div>}
        </div>
        <Collapse open={bags.open}>
          <BagEstimate fare={trip} hideTitle />
        </Collapse>
      </div>
    </div>
  );
};

export default StopoverFlights;
