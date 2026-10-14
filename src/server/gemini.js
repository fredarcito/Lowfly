// Gemini (Google AI) through its Interactions API. Only called from the server: the key never reaches the browser.
// Model and key come from the environment (GEMINI_MODEL is optional).
import { AppError } from "@/server/errors";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const DEFAULT_MODEL = "gemini-3.1-flash-lite";

// Asks the model for JSON that follows `schema` and returns it parsed, with the token usage.
// `thinking`: minimal | low | medium | high (more thinking, better plans, more output tokens to pay).
export const generateJson = async ({ instructions, prompt, schema, thinking = "low" }) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AppError("aiUnavailable");
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      input: `${instructions}\n\n${prompt}`,
      response_format: { type: "text", mime_type: "application/json", schema },
      generation_config: { thinking_level: thinking },
    }),
    cache: "no-store",
  });
  // Too many requests (429) or the model overloaded (503): busy, worth retrying later
  if (response.status === 429 || response.status === 503) throw new AppError("aiBusy");
  if (!response.ok) {
    console.error("Gemini error", response.status, (await response.text()).slice(0, 500));
    throw new AppError("aiUnavailable");
  }
  const interaction = await response.json();
  // The answer is the text of the model_output step (the other steps are its thoughts)
  const text = interaction.steps
    ?.filter((step) => step.type === "model_output")
    .flatMap((step) => step.content ?? [])
    .map((part) => part.text ?? "")
    .join("");
  try {
    return { data: JSON.parse(text), usage: interaction.usage };
  } catch {
    console.error("Gemini returned invalid JSON", text?.slice(0, 300));
    throw new AppError("aiUnavailable");
  }
};
