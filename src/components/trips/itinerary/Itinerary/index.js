"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateItinerary from "@/components/trips/itinerary/CreateItinerary";
import ItineraryDay from "@/components/trips/itinerary/ItineraryDay";
import ItineraryDayTabs from "@/components/trips/itinerary/ItineraryDayTabs";
import ItineraryLoader from "@/components/trips/itinerary/ItineraryLoader";
import ItineraryStickyBar from "@/components/trips/itinerary/ItineraryStickyBar";
import { useI18n } from "@/context/i18n";
import { errorMessage } from "@/i18n";
import { useItinerary } from "@/hooks/useItinerary";

// The trip's day-by-day plan (day tabs, then the picked day), or the button to create it
export default function Itinerary({ trip }) {
  const { lang, t } = useI18n();
  const { itinerary, days, day, dayIndex, pickDay, create, creation } =
    useItinerary(trip);
  const sectionRef = useRef(null);
  // Scrolled past the start of the days (the day tabs are stuck at the top): the slim bar shows on phones
  const sentinelRef = useRef(null);
  const [scrolledPast, setScrolledPast] = useState(false);
  const showsDays = Boolean(itinerary) && creation.status !== "creating";
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) =>
      setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showsDays]);

  if (creation.status === "creating") return <ItineraryLoader />;
  if (!itinerary)
    return (
      <CreateItinerary trip={trip} onCreate={create} creation={creation} />
    );

  // Another day: if the list was scrolled past its start, go back to the top of the day
  function showDay(index) {
    pickDay(index);
    const section = sectionRef.current;
    if (section && section.getBoundingClientRect().top < 0)
      section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section ref={sectionRef} className="grid grid-cols-1 gap-4">
      <div ref={sentinelRef} aria-hidden className="-mb-4 h-0" />
      <ItineraryStickyBar trip={trip} day={day} dayNumber={dayIndex + 1} visible={scrolledPast} />
      <ItineraryDayTabs days={days} picked={dayIndex} onPick={showDay} belowBar={scrolledPast} />
      {itinerary.lang && itinerary.lang !== lang && (
        <OtherLanguage
          itinerary={itinerary}
          creating={creation.status === "creating"}
          onCreate={() => create(itinerary.preferences)}
        />
      )}
      {creation.status === "error" && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {errorMessage(t, creation.error.code, creation.error.params)}
        </p>
      )}
      <ItineraryDay
        key={day.date}
        trip={trip}
        day={day}
        dayNumber={dayIndex + 1}
      />
    </section>
  );
}

// An AI itinerary made in another language: say so, and offer to make it again in this one
function OtherLanguage({ itinerary, creating, onCreate }) {
  const { lang, t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
      <p className="flex items-center gap-2 text-muted-foreground">
        <Languages className="size-4 shrink-0" />{" "}
        {t.trips.inLanguage(t.trips.languageNames[itinerary.lang])}
      </p>
      <Button
        variant="ghost"
        size="sm"
        disabled={creating}
        onClick={onCreate}
        className="font-semibold"
      >
        {creating && <Loader2 className="animate-spin" />}
        {creating
          ? t.trips.aiGenerating
          : t.trips.createIn(t.trips.languageNames[lang])}
      </Button>
    </div>
  );
}
