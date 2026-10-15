"use client";

import { useRef } from "react";
import ErrorNote from "@/components/shared/ErrorNote";
import CreateItinerary from "@/components/trips/itinerary/CreateItinerary";
import ItineraryDay from "@/components/trips/itinerary/ItineraryDay";
import ItineraryDayTabs from "@/components/trips/itinerary/ItineraryDayTabs";
import ItineraryLoader from "@/components/trips/itinerary/ItineraryLoader";
import ItineraryStickyBar from "@/components/trips/itinerary/ItineraryStickyBar";
import OtherLanguage from "@/components/trips/itinerary/OtherLanguage";
import { useI18n } from "@/context/i18n";
import { useItinerary } from "@/hooks/useItinerary";
import { useScrolledPast } from "@/hooks/useScrolledPast";

// The trip's day-by-day plan (day tabs, then the picked day), the loader while the AI makes it, or the card to
// create it. Once the page scrolls past the start of the days, the slim bar shows on phones (ItineraryStickyBar).
const Itinerary = ({ trip }) => {
  const { lang } = useI18n();
  const { itinerary, days, day, dayIndex, pickDay, create, creation } = useItinerary(trip);
  const sectionRef = useRef(null);
  const creating = creation.status === "creating";
  const { markerRef, scrolledPast } = useScrolledPast(Boolean(itinerary) && !creating);

  if (creating) return <ItineraryLoader />;
  if (!itinerary) return <CreateItinerary trip={trip} onCreate={create} creation={creation} />;

  // Another day: if the list was scrolled past its start, go back to the top of the day
  const showDay = (index) => {
    pickDay(index);
    const section = sectionRef.current;
    if (section && section.getBoundingClientRect().top < 0) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} className="grid grid-cols-1 gap-4">
      <div ref={markerRef} aria-hidden className="-mb-4 h-0" />
      <ItineraryStickyBar trip={trip} day={day} dayNumber={dayIndex + 1} visible={scrolledPast} />
      <ItineraryDayTabs days={days} picked={dayIndex} onPick={showDay} belowBar={scrolledPast} />
      {itinerary.lang && itinerary.lang !== lang && (
        <OtherLanguage itinerary={itinerary} creating={creating} onCreate={() => create(itinerary.preferences)} />
      )}
      {creation.status === "error" && <ErrorNote error={creation.error} />}
      <ItineraryDay key={day.date} trip={trip} day={day} dayNumber={dayIndex + 1} />
    </section>
  );
};

export default Itinerary;
