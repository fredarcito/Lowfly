// JSON from the AI: Gemini first; when it is busy or fails, Claude, with the same instructions and schema.
// Only called from the server.
import { AppError } from "@/server/errors";
import * as gemini from "@/server/gemini";
import * as claude from "@/server/claude";

// → { data, usage, model, provider }
export const generateJsonWithFallback = async (request) => {
  try {
    return { ...(await gemini.generateJson(request)), provider: "gemini" };
  } catch (error) {
    if (!(error instanceof AppError) || !claude.hasClaude()) throw error;
    console.warn(`Gemini failed (${error.code}), trying Claude`);
    return { ...(await claude.generateJson(request)), provider: "claude" };
  }
};
