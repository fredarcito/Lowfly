"use client";

import AudioGuideMiniPlayer from "@/components/trips/itinerary/AudioGuide/components/AudioGuideMiniPlayer";
import AudioGuideSheet from "@/components/trips/itinerary/AudioGuide/components/AudioGuideSheet";
import { AudioGuideContext } from "@/context/audioGuide";
import { useAudioGuidePlayer } from "@/components/trips/itinerary/AudioGuide/hooks/useAudioGuidePlayer";

// Audio guides for the itinerary's historic places (docs/audio-guide.md): each stop's button opens the player
// sheet; folded, it stays as a mini player at the bottom while the visitor looks at the rest of the plan.
const AudioGuide = ({ children }) => {
  const player = useAudioGuidePlayer();
  return (
    <AudioGuideContext.Provider value={player}>
      {children}
      <AudioGuideSheet />
      <AudioGuideMiniPlayer />
    </AudioGuideContext.Provider>
  );
};

export default AudioGuide;
