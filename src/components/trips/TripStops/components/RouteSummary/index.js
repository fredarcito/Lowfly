"use client";

import { Fragment } from "react";
import StayLength from "@/components/trips/TripStops/components/StayLength";

// The folded route on one line: "Roma ☾ 2 → Nápoles ☾ 2 → …", wrapping when it does not fit
const RouteSummary = ({ stops }) => (
  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
    {stops.map((stop, index) => (
      <Fragment key={`${stop.city}-${stop.arrive.day}`}>
        {index > 0 && (
          <span className="text-muted-foreground" aria-hidden>
            →
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="font-medium">{stop.city}</span>
          <span className="text-xs text-muted-foreground">
            <StayLength stop={stop} compact />
          </span>
        </span>
      </Fragment>
    ))}
  </span>
);

export default RouteSummary;
