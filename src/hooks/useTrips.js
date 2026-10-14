"use client";

import { useSyncExternalStore } from "react";
import { NO_TRIPS, readTrips, subscribeToTrips } from "@/store/trips";

// Saved trips, soonest first, kept up to date. On the server (and before hydrating) there are none.
export const useTrips = () => useSyncExternalStore(subscribeToTrips, readTrips, () => NO_TRIPS);
