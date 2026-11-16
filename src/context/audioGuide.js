"use client";

import { createContext, useContext } from "react";

// The audio guide playing in the itinerary (components/trips/itinerary/AudioGuide), or null outside one
export const AudioGuideContext = createContext(null);

export const useAudioGuide = () => useContext(AudioGuideContext);
