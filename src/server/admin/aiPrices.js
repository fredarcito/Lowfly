// List prices of the AI models that plan itineraries, in US dollars per million tokens (output includes the
// thinking). For the admin's cost figures; Gemini's free tier, while it lasts, actually costs nothing.
// Checked 2026-10-16: Claude Haiku 5.5 (Anthropic), Gemini 3.1 Flash-Lite (Google, as quoted by price trackers).
export const AI_PRICES = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "gemini-3.1-flash-lite": { input: 0.25, output: 1.5 },
};

// What one AI call cost, in dollars; 0 for a model without a price here
export const aiCallCost = ({ model, input_tokens: inputTokens, output_tokens: outputTokens }) => {
  const price = AI_PRICES[model];
  if (!price) return 0;
  return ((inputTokens ?? 0) * price.input + (outputTokens ?? 0) * price.output) / 1_000_000;
};
