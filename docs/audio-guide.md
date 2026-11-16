# Audio guides of historic places

Status (built 2026-11-16, not live yet): code, migration and `e2e/audio-guide.spec.js` written. To go live:
`GOOGLE_TTS_API_KEY` in `.env.local` and in Vercel, and the migration applied
(`supabase/migrations/20261116120000_create_audio_guides.sql`). No guide has been reviewed by a person
(`reviewed: false` on every row).

## What it is

On a trip's itinerary, every historic place has an "Audio guía" button next to "Cómo llegar": a stop whose history
comes from a Wikipedia article, or any "imprescindible" / "recomendado" stop with a place on the map. For the latter
(often places the traveller asked for, whose article was not found when the itinerary was made) the server searches
the article by the stop's name and then the map's name, plus the town, in Spanish and English, and keeps it only if
its coordinates are within 2 km (`findArticle` in `server/audioGuide/article.js`); none found → "Este sitio no tiene
audio guía". It opens a player sheet with the guide in 2 to 5 parts (1–2 minutes for a small place, 3–5 for a monument with a long history: as much as its article supports), each heard in one
spot ("La fachada · Fuera, por el lado norte"). Each part ends by saying where to go next; the audio never mentions the
app. Once the part is over its button ("Ya estoy dentro →") turns coral and the visitor taps it when they get there.
When the next part is heard from the same spot (`autoNext`), it starts by itself after 3 seconds ("Esperar" holds it).
Folding the sheet leaves a mini player at the bottom. The lock screen and headphones get play, pause and the parts
before and after (Media Session). A first-time hint explains the buttons once per browser.

## How a guide is made

One guide per Wikipedia article and language (`id` = hash of both), shared by every trip that visits the place: the
Acropolis is made once, for the first person who asks, and is free for everyone after that.

1. `POST /api/audio-guide { source, lang, place, town }` (`src/app/api/audio-guide/route.js`). `source` must be a
   Wikipedia article link (the stop's `sources`); without it, `{ place, mapName, town, lat, lng }` and the article is
   searched (above). The guide is written in the page's language whatever the article's language.
2. Already made → returned (anyone, signed in or not).
3. Otherwise it needs an account (`audioSignIn`, 401) and fewer than `AUDIO_GUIDE.newPerDay` (20) new guides by that
   person in 24 hours (`audioLimit`, 429).
4. The article's plain text (up to 14,000 characters, references left out) from Wikipedia.
5. The AI (Gemini, Claude when Gemini fails: `server/ai.js`) writes the steps from that text only, with the copy rules
   of CLAUDE.md in its instructions (no invented facts, no brochure phrases, concrete over general, every fact about
   this place). Steps are checked (`cleanSteps`): 2 to 5, the last never waits for a tap.
6. Each step is read aloud by Google Text-to-Speech (Chirp 3 HD: `es-ES-Chirp3-HD-Charon`, `en-US-Chirp3-HD-Charon`;
   `GOOGLE_TTS_VOICE_ES` / `_EN` override them) and kept as mp3 in the public bucket `audio-guides`
   (`<id>/<step>.mp3`).
7. The row in `audio_guides` keeps the steps with their audio URLs, the model, the voice, the AI's token usage and the
   characters read (what Google bills).

Making one takes some 20–40 seconds; the sheet shows "Preparando la audio guía…" meanwhile.

## Cost

- Voice: Google bills per character; Chirp 3 HD is about US$30 per million after the first million free each month
  (to check on Google's pricing page). A guide is some 1,500–3,000 characters, so a few hundred guides a month are free.
- AI: one short call per guide (Gemini's free tier, or Claude Haiku).
- Storage: a guide's mp3s are under 1 MB.

## Limits and known gaps

- Directions inside a place come only from the article; when it does not say how the place is laid out, the guide
  keeps them general ("Entra", "Rodea el edificio"). A wrong side or door is the main risk: review the most visited
  places first.
- No offline yet, and on iPhone's browser the audio may stop with the screen locked: both belong to the app
  (docs/mobile-app.md).
- Not in the city guides (`src/data/cityGuides.json`) yet, only in trips' itineraries.
- A guide is never remade on its own: to fix one, edit or delete its row (and its files) in Supabase.

## Map of the code

- Server: `src/server/audioGuide/` — `article.js` (the Wikipedia link and text), `script.js` (the AI's instructions,
  schema and checks), `speech.js` (Google TTS), `store.js` (table and bucket), `index.js` (`getAudioGuide`: find or
  make). `src/server/ai.js`: Gemini with Claude as backup, shared with the itinerary.
- API: `src/app/api/audio-guide/route.js`; browser service `src/api/audioGuide.js`. Constants:
  `src/constants/audioGuide.js`.
- UI: `src/components/trips/itinerary/AudioGuide/` (provider around the itinerary; `hooks/useAudioGuidePlayer.js` has
  all the player's state; `AudioGuideSheet/` and its parts; `AudioGuideMiniPlayer/`), the button
  `ItineraryStop/components/AudioGuideButton`, context `src/context/audioGuide.js`, hint `src/store/audioGuideHint.js`.
- Texts: `trips.audioGuide` and the `audio*` errors in `src/i18n/es.js` / `en.js`.
- Test: `e2e/audio-guide.spec.js` (the API answered by the test).
