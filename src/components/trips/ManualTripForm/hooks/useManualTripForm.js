"use client";

import { useRef, useState } from "react";
import { problemsOf, savedStops, tripDaysOf } from "@/utils/manualTrips";
import { changeManualTrip, saveManualTrip } from "@/store/trips";

// A town not filled in yet. `key`: only for React, the focus and the card's id, counted from 1 in each form (the
// same on the server and in the browser)
const newStop = (key, arriveDay = "", place = null) => ({ key, place, arriveDay, arriveTime: "", leaveDay: "", leaveTime: "", mustVisit: [] });

// The towns of a trip planned by hand, in order (each: place, arrival and departure day and time, the places to
// visit there for sure), what is wrong
// with them once the visitor tries to go on, and saving them: `save(id)` saves the trip (or, with the id of the one
// saved before, changes it) and returns its id, or null when something has to be fixed first.
// `initialPlace`: the first town already chosen (a route's page sends its destination), or null. `initialStops`:
// every town with its days and times ([{ place, arriveDay, arriveTime, leaveDay, leaveTime }], a trip through a hub
// from the search), or null.
export const useManualTripForm = (initialPlace = null, initialStops = null) => {
  const [stops, setStops] = useState(() =>
    initialStops?.length
      ? initialStops.map(({ place, arriveDay, arriveTime, leaveDay, leaveTime }, index) => ({ ...newStop(index + 1, arriveDay, place), arriveTime, leaveDay, leaveTime }))
      : [newStop(1, "", initialPlace)]
  );
  // The key of the next town added (only read when one is added)
  const nextKey = useRef(stops.length + 1);
  const [submitted, setSubmitted] = useState(false);
  // The town just added with "Add another town" (it takes the focus), by key
  const [addedKey, setAddedKey] = useState(null);
  const problems = problemsOf(stops);

  const change = (key, changes) => setStops((current) => current.map((stop) => (stop.key === key ? { ...stop, ...changes } : stop)));
  const remove = (key) => setStops((current) => current.filter((stop) => stop.key !== key));
  // The next town starts the day you leave the last one
  const add = () => {
    const added = newStop(nextKey.current++, stops.at(-1).leaveDay);
    setAddedKey(added.key);
    setStops((current) => [...current, added]);
  };

  const save = (savedId) => {
    setSubmitted(true);
    if (!problems.valid) return null;
    // Back from the next step, no card takes the focus again
    setAddedKey(null);
    if (!savedId) return saveManualTrip(savedStops(stops));
    changeManualTrip(savedId, savedStops(stops));
    return savedId;
  };

  return {
    stops,
    change,
    remove,
    add,
    save,
    addedKey,
    tripDays: tripDaysOf(stops),
    // How much of the route is filled in, 0 to 1: each town's place and dates
    completion: stops.reduce((done, stop) => done + (stop.place ? 1 : 0) + (stop.arriveDay && stop.leaveDay ? 1 : 0), 0) / (stops.length * 2),
    // Shown only after the first try
    problemOf: (index) => (submitted ? problems.each[index] : null),
    tooLong: submitted && problems.tooLong,
  };
};
