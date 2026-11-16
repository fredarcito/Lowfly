"use client";

import { Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioGuide } from "@/context/audioGuide";
import { useI18n } from "@/context/i18n";

// Sights worth a guide: the ones to see, not the optional extras (a shop, a viewpoint)
const GUIDED_TYPES = new Set(["imprescindible", "recomendado"]);

// "Audio guide" on a historic place: a stop whose history comes from a Wikipedia article (the guide is told from
// it), or a sight with a place on the map, whose article the server looks for (docs/audio-guide.md).
// `town`: where the stop is, so the guide knows which place of that name it is.
const AudioGuideButton = ({ stop, town }) => {
  const { texts } = useI18n();
  const player = useAudioGuide();
  const source = stop.history ? (stop.sources?.find((item) => item.url?.includes("wikipedia.org/wiki/"))?.url ?? null) : null;
  const located = GUIDED_TYPES.has(stop.type) && Number.isFinite(stop.place?.lat);
  if (!player || (!source && !located)) return null;

  // The key the player knows this place by: its article, or where it is
  const key = source ?? `${stop.place.lat},${stop.place.lng}`;
  const words = texts.trips.audioGuide;
  return (
    <Button
      variant="outline"
      className="h-10"
      onClick={() => player.open({ key, source, title: stop.title, mapName: stop.place?.name, town, lat: stop.place?.lat, lng: stop.place?.lng })}
    >
      <Headphones /> {player.isListened(key) ? words.listened : words.open}
    </Button>
  );
};

export default AudioGuideButton;
