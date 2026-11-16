// Audio guides kept for good: the row in audio_guides and its mp3 files in the public "audio-guides" bucket
// (supabase/migrations). Server only: the secret key skips RLS.
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/supabase/admin";
import { AUDIO_GUIDE } from "@/constants/audioGuide";

const DAY = 86_400_000;

// One guide per article and language: the same Acropolis for every trip that visits it
export const guideId = (articleUrl, lang) => createHash("sha256").update(`${lang}:${articleUrl}`).digest("hex").slice(0, 24);

// What the browser gets: the place, the steps with their audio, and whether a person has checked it
const toGuide = (row) => ({ id: row.id, lang: row.lang, title: row.title, source: row.article_url, reviewed: row.reviewed, steps: row.steps });

export const findGuide = async (id) => {
  const { data, error } = await supabaseAdmin().from("audio_guides").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toGuide(data) : null;
};

// How many guides this person made in the last 24 hours
export const guidesMadeToday = async (userId) => {
  const since = new Date(Date.now() - DAY).toISOString();
  const { count, error } = await supabaseAdmin()
    .from("audio_guides")
    .select("id", { count: "exact", head: true })
    .eq("created_by", userId)
    .gte("created_at", since);
  if (error) throw error;
  return count;
};

// The step's mp3 in the bucket → its public URL
export const saveAudio = async (id, index, mp3) => {
  const path = `${id}/${index + 1}.mp3`;
  const bucket = supabaseAdmin().storage.from(AUDIO_GUIDE.bucket);
  const { error } = await bucket.upload(path, mp3, { contentType: "audio/mpeg", upsert: true });
  if (error) throw error;
  return bucket.getPublicUrl(path).data.publicUrl;
};

export const saveGuide = async (row) => {
  const { data, error } = await supabaseAdmin().from("audio_guides").upsert(row).select("*").single();
  if (error) throw error;
  return toGuide(data);
};
