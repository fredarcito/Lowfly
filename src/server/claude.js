// Claude (Anthropic) through its official SDK: the backup when Gemini is busy. Only called from the server: the key
// never reaches the browser. Key and model come from the environment (CLAUDE_MODEL and, for a key that is not
// scoped to a workspace, ANTHROPIC_WORKSPACE_ID are optional).
import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "@/server/errors";

const DEFAULT_MODEL = "claude-haiku-5-5";
// Room for a 10-day plan plus the model's thinking (streamed, so a long answer does not time out)
const MAX_TOKENS = 64_000;

let client = null;

const getClient = () => {
  if (!client) {
    const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
    client = new Anthropic({ defaultHeaders: workspace ? { "anthropic-workspace-id": workspace } : undefined });
  }
  return client;
};

// Claude only accepts a schema whose objects close their properties (additionalProperties: false)
const closed = (schema) => {
  if (Array.isArray(schema)) return schema.map(closed);
  if (!schema || typeof schema !== "object") return schema;
  const copy = Object.fromEntries(Object.entries(schema).map(([key, value]) => [key, closed(value)]));
  const isObject = copy.type === "object" || (Array.isArray(copy.type) && copy.type.includes("object"));
  return isObject ? { ...copy, additionalProperties: false } : copy;
};

export const hasClaude = () => Boolean(process.env.ANTHROPIC_API_KEY);

// Same contract as server/gemini: JSON that follows `schema`, parsed, with the token usage and the model.
// `effort`: low | medium | high (more thinking, better plans, more output tokens to pay).
export const generateJson = async ({ instructions, prompt, schema, effort = "low" }) => {
  if (!hasClaude()) throw new AppError("aiUnavailable");
  const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
  let message;
  try {
    message = await getClient()
      .messages.stream({
        model,
        max_tokens: MAX_TOKENS,
        system: instructions,
        messages: [{ role: "user", content: prompt }],
        output_config: { effort, format: { type: "json_schema", schema: closed(schema) } },
      })
      .finalMessage();
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError || error?.status === 529) throw new AppError("aiBusy");
    if (error instanceof Anthropic.APIError) {
      console.error("Claude error", error.status, error.message?.slice(0, 500));
      throw new AppError("aiUnavailable");
    }
    throw error;
  }
  // A refusal or a cut answer does not follow the schema
  if (message.stop_reason !== "end_turn") {
    console.error("Claude stopped early", message.stop_reason);
    throw new AppError("aiUnavailable");
  }
  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  try {
    return { data: JSON.parse(text), usage: message.usage, model };
  } catch {
    console.error("Claude returned invalid JSON", text.slice(0, 300));
    throw new AppError("aiUnavailable");
  }
};
