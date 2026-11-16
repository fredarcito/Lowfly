// Audio guides of historic places (docs/audio-guide.md)
import { api } from "@/api/client";

// The guide of a stop: `source` is the Wikipedia link of its history; without one, the server looks for the
// place's article by its names (`place`, then `mapName`), `town` and where it is (`lat`, `lng`), and for a place without
// one it searches the web. Making a new one can take a minute or two.
// → { id, lang, title, source, fromWeb, reviewed, steps: [{ title, where, action, autoNext, text, audio, seconds }] }
export const getAudioGuide = ({ source, lang, place, mapName, town, lat, lng }, options) =>
  api.post("/audio-guide", { source, lang, place, mapName, town, lat, lng }, { timeout: 310_000, ...options }).then((response) => response.data);
