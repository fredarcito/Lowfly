// Audio guides of historic places (docs/audio-guide.md)
export const AUDIO_GUIDE = {
  // New guides a signed-in person may have made in 24 hours (listening to one already made is free and unlimited)
  newPerDay: 20,
  // Steps of a guide, and words in each one (2026-11-17, the owner's call: 3–5 minutes felt too short): as long as the
  // material (sources and what the AI knows), from some 5 minutes to 15, never padded
  minSteps: 3,
  maxSteps: 12,
  minWords: 80,
  maxWords: 260,
  // Seconds the next step waits before starting by itself, when it is heard from the same spot
  autoNextSeconds: 3,
  // Speaking speed used to estimate a step's length before its audio loads (words a second)
  wordsPerSecond: 2.5,
  // Google Text-to-Speech voices (Chirp 3 HD); GOOGLE_TTS_VOICE_ES / GOOGLE_TTS_VOICE_EN override them
  // Sadachbia ("lively"): chosen by ear on 2026-11-16 over Charon, Sulafat, Achird, Puck and Aoede for telling stories
  voices: { es: "es-ES-Chirp3-HD-Sadachbia", en: "en-US-Chirp3-HD-Sadachbia" },
  bucket: "audio-guides",
};
