import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { prepareDiff } from "@/lib/review/diff";
import { ReviewIncompleteError, ReviewRefusedError, reviewDiff } from "@/lib/review/review-diff";
import type { ReviewErrorResponse, ReviewSuccessResponse } from "@/lib/review/types";

// Reviews can take a while; allow up to 5 minutes (the Vercel Hobby maximum).
export const maxDuration = 300;

/** Largest paste we accept at all. */
export const MAX_INPUT_CHARS = 500_000;
/** Largest diff we send to the model after skipping files (~25k tokens, about $0.10 of input). */
export const MAX_REVIEW_CHARS = 100_000;

const RequestSchema = z.object({ diff: z.string() });

function errorResponse(status: number, error: string) {
  return Response.json({ error } satisfies ReviewErrorResponse, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Request body must be JSON.");
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'Request body must look like { "diff": "..." }.');
  }

  const { diff } = parsed.data;
  if (!diff.trim()) {
    return errorResponse(400, "Paste a diff to review.");
  }
  if (diff.length > MAX_INPUT_CHARS) {
    return errorResponse(413, "That diff is too large. Try a smaller pull request.");
  }

  const prepared = prepareDiff(diff);
  if (!prepared.reviewableDiff) {
    return errorResponse(
      422,
      "Every file in this diff was skipped (lockfiles, generated or binary files), so there is nothing to review.",
    );
  }
  if (prepared.reviewableDiff.length > MAX_REVIEW_CHARS) {
    return errorResponse(
      413,
      `After skipping generated files the diff is still ${prepared.reviewableDiff.length.toLocaleString("en-US")} characters. The limit is ${MAX_REVIEW_CHARS.toLocaleString("en-US")}.`,
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return errorResponse(500, "The server has no ANTHROPIC_API_KEY. Add it to .env.local and restart.");
  }

  try {
    const { review, usage } = await reviewDiff(prepared.reviewableDiff);

    // Log numbers only, never the diff: it may be someone's private code.
    console.info(
      JSON.stringify({
        event: "review.completed",
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costUsd: usage.costUsd,
        durationMs: usage.durationMs,
        files: prepared.reviewedFiles.length,
        risks: review.risks.length,
      }),
    );

    return Response.json({
      review,
      usage,
      reviewedFiles: prepared.reviewedFiles,
      skippedFiles: prepared.skippedFiles,
    } satisfies ReviewSuccessResponse);
  } catch (error) {
    return handleReviewError(error);
  }
}

function handleReviewError(error: unknown) {
  if (error instanceof ReviewRefusedError) {
    return errorResponse(422, "The AI declined to review this diff.");
  }
  if (error instanceof ReviewIncompleteError) {
    return errorResponse(502, `${error.message} Please try again.`);
  }

  // Most specific first: these all extend Anthropic.APIError.
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("review.failed: invalid ANTHROPIC_API_KEY");
    return errorResponse(500, "The server's ANTHROPIC_API_KEY is invalid.");
  }
  if (error instanceof Anthropic.RateLimitError) {
    return errorResponse(429, "Too many reviews at once. Wait a minute and try again.");
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return errorResponse(504, "The review took too long. Try a smaller diff.");
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return errorResponse(502, "Could not reach the AI service. Please try again.");
  }
  if (error instanceof Anthropic.APIError) {
    console.error(`review.failed: API error ${error.status}`, error.message);
    return errorResponse(502, "The AI service returned an error. Please try again.");
  }

  console.error("review.failed: unexpected error", error);
  return errorResponse(500, "Something went wrong while reviewing. Please try again.");
}
