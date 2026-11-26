import type { Review } from "./schema";

/** What POST /api/review returns. Shared by the API route and the review page. */

export type ReviewUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  /** null when the response came from a model we have no price for */
  costUsd: number | null;
  durationMs: number;
};

export type ReviewSuccessResponse = {
  review: Review;
  usage: ReviewUsage;
  reviewedFiles: string[];
  skippedFiles: string[];
};

export type ReviewErrorResponse = {
  error: string;
};
