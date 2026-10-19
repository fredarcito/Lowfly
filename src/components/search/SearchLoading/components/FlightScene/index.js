"use client";

import { usePrefersReducedMotion } from "@/components/search/SearchLoading/hooks/usePrefersReducedMotion";

// The flight's arc, from the departure airport (left) to the arrival board (right)
const ROUTE = "M 40 92 Q 160 -8 280 92";
const FLIGHT_SECONDS = 3;
// Slow take-off and landing
const EASING = "0.45 0 0.55 1";
// Lucide's plane and cloud (24×24). The plane points up-right: turned 45° it flies along the arc
const PLANE =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";
const CLOUD = "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z";

const PlaneShape = () => (
  <g transform="rotate(45) scale(1.3) translate(-12 -12)">
    <path d={PLANE} fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
  </g>
);

// A plane flying over a dashed arc between two airport codes, with clouds drifting behind. `destination` changes
// while the search runs, like a board looking for where to go. With reduced motion, the plane waits mid-way.
const FlightScene = ({ origin, destination }) => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <svg viewBox="0 0 320 130" className="w-full max-w-sm" aria-hidden>
      <g className="flight-cloud-slow text-muted-foreground/15">
        <path d={CLOUD} transform="translate(64 14) scale(1.7)" fill="currentColor" />
      </g>
      <g className="flight-cloud-fast text-muted-foreground/10">
        <path d={CLOUD} transform="translate(206 38) scale(1.2)" fill="currentColor" />
      </g>

      <path
        d={ROUTE}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 7"
        strokeLinecap="round"
        className="flight-route text-muted-foreground/40"
      />

      {/* The trail: the arc drawn behind the plane, on the same easing */}
      {!reducedMotion && (
        <path d={ROUTE} pathLength="1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 1" className="text-primary/60">
          <animate attributeName="stroke-dashoffset" values="1;0" dur={`${FLIGHT_SECONDS}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines={EASING} />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur={`${FLIGHT_SECONDS}s`} repeatCount="indefinite" />
        </path>
      )}

      <circle cx="40" cy="92" r="5" className="fill-primary" />
      <circle cx="280" cy="92" r="5" className="flight-pulse fill-primary/30" />
      <circle cx="280" cy="92" r="5" className="fill-primary" />

      <text x="40" y="120" textAnchor="middle" className="fill-foreground font-heading text-[13px] font-bold">
        {origin || "···"}
      </text>
      <text
        key={destination}
        x="280"
        y="120"
        textAnchor="middle"
        className="fill-muted-foreground font-heading text-[13px] font-bold tabular-nums duration-300 animate-in fade-in motion-reduce:animate-none"
      >
        {destination}
      </text>

      <g className="text-primary">
        {reducedMotion ? (
          <g transform="translate(160 42)">
            <PlaneShape />
          </g>
        ) : (
          <g>
            <animateMotion dur={`${FLIGHT_SECONDS}s`} repeatCount="indefinite" path={ROUTE} rotate="auto" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines={EASING} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur={`${FLIGHT_SECONDS}s`} repeatCount="indefinite" />
            <PlaneShape />
          </g>
        )}
      </g>
    </svg>
  );
};

export default FlightScene;
