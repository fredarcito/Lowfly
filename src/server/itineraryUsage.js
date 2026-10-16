// What each AI itinerary cost, kept for good in itinerary_usage (supabase/migrations): one row per AI call.
// Only called from the server.
import { supabaseAdmin } from "@/supabase/admin";

// Tokens in the same terms for both providers. Output includes the thinking, as both bill it:
// Claude counts it inside output_tokens, Gemini apart (total_thought_tokens).
const tokensOf = (provider, usage = {}) =>
  provider === "gemini"
    ? {
        input_tokens: usage.total_input_tokens ?? null,
        output_tokens: (usage.total_output_tokens ?? 0) + (usage.total_thought_tokens ?? 0),
        thinking_tokens: usage.total_thought_tokens ?? null,
      }
    : {
        input_tokens: usage.input_tokens ?? null,
        output_tokens: usage.output_tokens ?? null,
        thinking_tokens: usage.output_tokens_details?.thinking_tokens ?? null,
      };

// calls: what planDays reported ({ city, country, days, provider, model, usage, durationMs });
// request: { userId, kind: "flight" | "stops", lang, airport, preferences }. A failure is only logged.
export const saveItineraryUsage = async (calls, { userId, kind, lang, airport, preferences }) => {
  if (!calls.length || !process.env.SUPABASE_SECRET_KEY) return;
  const requestId = crypto.randomUUID();
  const rows = calls.map((call) => ({
    request_id: requestId,
    user_id: userId,
    kind,
    lang,
    city: call.city,
    country: call.country || null,
    airport: airport ?? null,
    days: call.days,
    preferences,
    provider: call.provider,
    model: call.model,
    ...tokensOf(call.provider, call.usage),
    usage: call.usage ?? null,
    duration_ms: call.durationMs,
  }));
  const { error } = await supabaseAdmin().from("itinerary_usage").insert(rows);
  if (error) console.error("Could not save the itinerary usage", error.message);
};
