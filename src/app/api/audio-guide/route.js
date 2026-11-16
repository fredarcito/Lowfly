import { NextResponse } from "next/server";
import { AppError, badRequest } from "@/server/errors";
import { findArticle, placeWithoutArticle, readArticleUrl } from "@/server/audioGuide/article";
import { getAudioGuide } from "@/server/audioGuide";
import { guidesMadeToday } from "@/server/audioGuide/store";
import { supabaseServer } from "@/supabase/server";
import { hasLocale } from "@/i18n/config";
import { AUDIO_GUIDE } from "@/constants/audioGuide";

// Making a guide: the article (or a web search for a place without one), the AI and reading 2 to 5 steps aloud,
// usually under a minute; a web search can add half a minute
export const maxDuration = 300;

const shortText = (value) => (typeof value === "string" && value.trim() ? value.trim().slice(0, 100) : null);

// POST /api/audio-guide { source: Wikipedia link of the stop's history, lang, place: the stop's name, town }, or for a
// stop without history { lang, place, mapName, town, lat, lng } (its article is searched by name and checked by where it is)
// → { id, lang, title, source, fromWeb, reviewed, steps: [{ title, where, action, autoNext, text, audio, seconds }] }
// A guide someone already made is for anyone; making a new one needs an account (it costs money), a few a day.
export const POST = async (request) => {
  try {
    const body = await request.json().catch(() => null);
    if (!body) throw badRequest("audioBadPlace");
    const lang = hasLocale(body.lang) ? body.lang : "es";
    const place = { name: shortText(body.place), mapName: shortText(body.mapName), town: shortText(body.town), lat: body.lat, lng: body.lng };
    // A place with no article of its own still gets a guide, told from what the AI knows (docs/audio-guide.md)
    const findOrTellFromKnowledge = () =>
      findArticle({ ...place, lang }).catch((error) => {
        if (error instanceof AppError && error.status === 404) return placeWithoutArticle(place);
        throw error;
      });
    const article = body.source ? readArticleUrl(body.source) : await findOrTellFromKnowledge();

    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub ?? null;

    const canMake = async () => {
      if (!userId) throw new AppError("audioSignIn", {}, 401);
      if ((await guidesMadeToday(userId)) >= AUDIO_GUIDE.newPerDay) throw new AppError("audioLimit", { max: AUDIO_GUIDE.newPerDay }, 429);
    };

    const guide = await getAudioGuide({ article, lang, place: shortText(body.place), town: shortText(body.town), userId, canMake });
    return NextResponse.json(guide, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ error: error.code, params: error.params }, { status: error.status });
    console.error(error);
    return NextResponse.json({ error: "audioUnavailable" }, { status: 502 });
  }
};
