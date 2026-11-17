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
its coordinates are within 500 m and its title shares a telltale word with the stop's name (`findArticle` in
`server/audioGuide/article.js`; Thessaloniki's St Paul once got Hagia Sophia, 1.3 km away). None found (2026-11-16, the
owner's call: no place left without a guide, the way ChatGPT and Gemini answer about it):
   - the web search's notes play the article's part (see "Web search" below). Footer: "Escrita con IA a partir de
     búsquedas en la web. Sin revisar…" (`fromWeb`, from `usage.research` on the row).
   - The search found nothing (or Claude is down): a guide of 3–4 parts (some 5 minutes) from the AI's own knowledge
     (`knowledgeInstructionsFor` in `script.js`): the place's name and saint, its neighbourhood, the city's story and
     legends, never what is inside or "a tu izquierda". Footer: "Escrita con IA. Este sitio no tiene artículo…".
   Both are kept under a `lowfly:place/<name>|<town>|<lat,lng to ~100 m>` key instead of an article link
   (`placeWithoutArticle`). Making one can take up to two minutes (route `maxDuration` 300 s). It opens a player sheet with the guide in 3 to 12 parts (2026-11-17, the owner's call: 3–5 minutes felt too short; the length follows how much good material
there is, from the sources and what the AI knows, not the kind of place — some 5 minutes with little, up to 15 with a lot,
never padded), each heard in one
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
4. The article's plain text (up to 14,000 characters, references left out) from Wikipedia, plus the same place's
   article in the other language when there is one (`companionArticle`: English ones are often much longer).
5. The AI (Gemini, Claude when Gemini fails: `server/ai.js`; kept on the cheap models on purpose) writes the steps.
   The experience comes first (2026-11-16, the owner's call): a story with emotion told by a local guide, not an
   encyclopedia. Every step carries a curiosity or anecdote; the AI adds context, gossip of the time and legends guides
   tell even when unprovable, always told as such ("se cuenta que…"). Only what the listener checks with their eyes
   (directions, what a wall or mosaic shows) and exact figures come strictly from the articles. Plus the copy rules of CLAUDE.md (no
   brochure phrases, concrete over general, every fact about this place). Steps are checked (`cleanSteps`): 3 to 12, the last never waits for a tap.
   Museums are told as a story, not a room-by-room walk: their pieces move and they have their own audio guide. The
   museum's story, then one part per star piece, named so the listener finds it ("busca el papiro de Derveni"), never a
   room, floor or case number; the last part may suggest the museum's own audio guide.
6. Each step is read aloud by Google Text-to-Speech (Chirp 3 HD: `es-ES-Chirp3-HD-Sadachbia`, `en-US-Chirp3-HD-Sadachbia`, chosen by ear;
   `GOOGLE_TTS_VOICE_ES` / `_EN` override them) and kept as mp3 in the public bucket `audio-guides`
   (`<id>/<step>.mp3`).
7. The row in `audio_guides` keeps the steps with their audio URLs, the model, the voice, the AI's token usage and the
   characters read (what Google bills).

Making one takes some 20–40 seconds; the sheet shows "Preparando la audio guía…" meanwhile.

## Web search

Every new guide also searches the web (2026-11-16, the owner's call: curiosities and emotion over an encyclopedia),
beside the Wikipedia articles: `research.js`, through `researchWithSearch` in `server/claude.js` (Claude Haiku, up to 5
searches with the basic `web_search_20250305`; the newer `_20260209` failed every search with Haiku in a test).
- With an article: the search looks only for what it lacks — curiosities, legends, anecdotes, and how the visit goes
  (entrance, route inside, what is in each part). The script trusts the articles for dates, names and numbers, and the
  notes for stories and the visit. Footer: "… a partir de Wikipedia y búsquedas en la web".
- Without an article: the search brings everything (above).
- Opening hours, prices and tickets are left out of notes and audio: a guide is recorded once and kept for years.
- Every guide opens with a short introduction (where you are, what it is, a hook) before the first "mira…".
- Notes under 120 words or no search made → the guide is made without them.
- Measured: St Paul (no article) 2 searches, ~US$0.024; the Rotunda (complement) 3 searches, ~US$0.035.

## Cost

- Voice: Google bills per character; Chirp 3 HD is about US$30 per million after the first million free each month
  (to check on Google's pricing page). A guide is some 5,000–18,000 characters (5–15 minutes), so some US$0.15–0.55 each once past the free million
  (some 60–200 guides a month are free).
- AI: one short call per guide (Gemini's free tier, or Claude Haiku), plus the web search: US$0.01 a search, up to 5,
  and the pages it reads (~US$0.003 on Haiku). Some 3–7 US cents a new guide in all, besides the voice.
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
