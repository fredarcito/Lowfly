// Google Cloud Text-to-Speech (Chirp 3 HD voices): a step's text → mp3. Only called from the server.
// GOOGLE_TTS_API_KEY: an API key restricted to the Text-to-Speech API (its project needs billing on; the first
// million characters a month are free).
import { AppError } from "@/server/errors";
import { AUDIO_GUIDE } from "@/constants/audioGuide";

const ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";

export const hasSpeech = () => Boolean(process.env.GOOGLE_TTS_API_KEY);

// The voice for `lang`: "es-ES-Chirp3-HD-Charon" (its language code is the first two parts)
export const voiceFor = (lang) => process.env[`GOOGLE_TTS_VOICE_${lang.toUpperCase()}`] || AUDIO_GUIDE.voices[lang];

// → a Buffer with the mp3
export const speak = async (text, lang) => {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) throw new AppError("audioUnavailable");
  const voice = voiceFor(lang);
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: voice.split("-").slice(0, 2).join("-"), name: voice },
      audioConfig: { audioEncoding: "MP3" },
    }),
    cache: "no-store",
  });
  if (response.status === 429) throw new AppError("audioBusy");
  if (!response.ok) {
    console.error("Google TTS error", response.status, (await response.text()).slice(0, 500));
    throw new AppError("audioUnavailable");
  }
  const { audioContent } = await response.json();
  if (!audioContent) throw new AppError("audioUnavailable");
  return Buffer.from(audioContent, "base64");
};
