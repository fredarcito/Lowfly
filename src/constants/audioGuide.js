// Audio guides of historic places (docs/audio-guide.md)
export const AUDIO_GUIDE = {
  // New guides a signed-in person may have made in 24 hours (listening to one already made is free and unlimited)
  newPerDay: 20,
  // Steps of a guide, and words in each one: a small place gets the fewest and shortest (1–2 minutes), a monument
  // with a long history the most (3–5 minutes); never more than its article supports
  minSteps: 2,
  maxSteps: 5,
  minWords: 60,
  maxWords: 170,
  // Seconds the next step waits before starting by itself, when it is heard from the same spot
  autoNextSeconds: 3,
  // Speaking speed used to estimate a step's length before its audio loads (words a second)
  wordsPerSecond: 2.5,
  // Google Text-to-Speech voices (Chirp 3 HD); GOOGLE_TTS_VOICE_ES / GOOGLE_TTS_VOICE_EN override them
  voices: { es: "es-ES-Chirp3-HD-Charon", en: "en-US-Chirp3-HD-Charon" },
  bucket: "audio-guides",
};
