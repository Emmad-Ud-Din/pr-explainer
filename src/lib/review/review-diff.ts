import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { estimateCostUsd } from "./cost";
import { buildUserMessage, SYSTEM_PROMPT } from "./prompt";
import { ReviewSchema, type Review } from "./schema";
import type { ReviewUsage } from "./types";

export const REVIEW_MODEL = "claude-opus-5-5";

/** The model declined to review this diff (a safety classifier stopped it). */
export class ReviewRefusedError extends Error {}

/** The model answered, but not with a complete, valid review. */
export class ReviewIncompleteError extends Error {}

let client: Anthropic | undefined;

function getClient(): Anthropic {
  // Reads ANTHROPIC_API_KEY from the environment. Two attempts of up to
  // 2 minutes each stays inside the route's 5 minute limit.
  client ??= new Anthropic({ timeout: 120_000, maxRetries: 1 });
  return client;
}

export async function reviewDiff(diff: string): Promise<{ review: Review; usage: ReviewUsage }> {
  const startedAt = Date.now();

  const response = await getClient().beta.messages.parse({
    model: REVIEW_MODEL,
    max_tokens: 16000,
    // If a safety classifier declines the request, the API retries it on
    // another model in the same call instead of failing.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      // Opus 5.5 defaults to "medium"; set explicitly so it is a visible choice.
      // Try "high" when running the eval in Phase 5 to see if it catches more bugs.
      effort: "medium",
      format: betaZodOutputFormat(ReviewSchema),
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(diff) }],
  });

  if (response.stop_reason === "refusal") {
    throw new ReviewRefusedError("The model declined to review this diff.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new ReviewIncompleteError("The review was cut off because it got too long.");
  }
  if (!response.parsed_output) {
    throw new ReviewIncompleteError("The model's answer did not match the review format.");
  }

  const { usage } = response;
  return {
    review: response.parsed_output,
    usage: {
      model: response.model,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      costUsd: estimateCostUsd(response.model, {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheReadInputTokens: usage.cache_read_input_tokens ?? 0,
        cacheCreationInputTokens: usage.cache_creation_input_tokens ?? 0,
      }),
      durationMs: Date.now() - startedAt,
    },
  };
}
