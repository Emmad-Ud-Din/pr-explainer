/** US dollars per million tokens. Check https://claude.com/pricing when changing models. */
type ModelPricing = {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
};

const PRICING: Record<string, ModelPricing> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
};

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens?: number;
  cacheCreationInputTokens?: number;
};

/** Returns the cost in dollars, or null if we have no price for the model. */
export function estimateCostUsd(model: string, usage: TokenUsage): number | null {
  const price = PRICING[model];
  if (!price) return null;

  const cost =
    usage.inputTokens * price.input +
    usage.outputTokens * price.output +
    (usage.cacheReadInputTokens ?? 0) * price.cacheRead +
    (usage.cacheCreationInputTokens ?? 0) * price.cacheWrite;

  return cost / 1_000_000;
}
