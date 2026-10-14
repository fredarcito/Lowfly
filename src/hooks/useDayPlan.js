"use client";

import { useMemo } from "react";
import { dayPlan } from "@/utils/itinerary";

// The picked day ready to show (numbered stops, walks, map points, Maps links); recomputed only when the day changes
export const useDayPlan = (day) => useMemo(() => dayPlan(day), [day]);
