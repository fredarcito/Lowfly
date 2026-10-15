"use client";

import { useRef, useState } from "react";
import { problemsOf, savedStops, tripDaysOf } from "@/utils/manualTrips";
import { saveManualTrip } from "@/store/trips";

// The towns of a trip planned by hand, in order (each: place, arrival and departure day and time), what is wrong
// with them once the visitor tries to create it, and creating it: `create()` saves the trip and returns its id,
// or null when something has to be fixed first.
export const useManualTripForm = () => {
  const nextKey = useRef(1);
  const newStop = (arriveDay = "") => ({ key: nextKey.current++, place: null, arriveDay, arriveTime: "", leaveDay: "", leaveTime: "" });
  const [stops, setStops] = useState(() => [newStop()]);
  const [submitted, setSubmitted] = useState(false);
  const problems = problemsOf(stops);

  const change = (key, changes) => setStops((current) => current.map((stop) => (stop.key === key ? { ...stop, ...changes } : stop)));
  const remove = (key) => setStops((current) => current.filter((stop) => stop.key !== key));
  // The next town starts the day you leave the last one
  const add = () => setStops((current) => [...current, newStop(current.at(-1).leaveDay)]);

  const create = () => {
    setSubmitted(true);
    return problems.valid ? saveManualTrip(savedStops(stops)) : null;
  };

  return {
    stops,
    change,
    remove,
    add,
    create,
    tripDays: tripDaysOf(stops),
    // Shown only after the first try
    problemOf: (index) => (submitted ? problems.each[index] : null),
    tooLong: submitted && problems.tooLong,
  };
};
