import { describe, expect, it } from "vitest";
import { estimateCostUsd } from "./cost";

describe("estimateCostUsd", () => {
  it("prices input and output tokens", () => {
    // 10k input at $4/M = $0.04, 2k output at $20/M = $0.04
    expect(estimateCostUsd("claude-opus-5-5", { inputTokens: 10_000, outputTokens: 2_000 })).toBeCloseTo(0.08);
  });

  it("includes cache reads and writes", () => {
    const cost = estimateCostUsd("claude-opus-5-5", {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadInputTokens: 1_000_000,
      cacheCreationInputTokens: 1_000_000,
    });
    expect(cost).toBeCloseTo(5.2);
  });

  it("returns null for models without a price", () => {
    expect(estimateCostUsd("some-other-model", { inputTokens: 1, outputTokens: 1 })).toBeNull();
  });
});
