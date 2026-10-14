"use client";

import { useRef } from "react";
import CreateItinerary from "@/components/trips/itinerary/CreateItinerary";
import ItineraryDay from "@/components/trips/itinerary/ItineraryDay";
import ItineraryDayTabs from "@/components/trips/itinerary/ItineraryDayTabs";
import { useItinerary } from "@/hooks/useItinerary";

// The trip's day-by-day plan (day tabs, then the picked day), or the button to create it
export default function Itinerary({ trip }) {
  const { itinerary, days, day, dayIndex, pickDay, create } = useItinerary(trip);
  const sectionRef = useRef(null);
  if (!itinerary) return <CreateItinerary trip={trip} onCreate={create} />;

  // Another day: if the list was scrolled past its start, go back to the top of the day
  function showDay(index) {
    pickDay(index);
    const section = sectionRef.current;
    if (section && section.getBoundingClientRect().top < 0) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section ref={sectionRef} className="grid gap-4">
      <ItineraryDayTabs days={days} picked={dayIndex} onPick={showDay} />
      <ItineraryDay key={day.date} trip={trip} day={day} dayNumber={dayIndex + 1} />
    </section>
  );
}
