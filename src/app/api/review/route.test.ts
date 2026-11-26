import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Review } from "@/lib/review/schema";

// Replace the real Claude call so tests are free, fast and predictable.
vi.mock("@/lib/review/review-diff", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/review/review-diff")>();
  return { ...actual, reviewDiff: vi.fn() };
});

const { reviewDiff, ReviewRefusedError, ReviewIncompleteError } = await import("@/lib/review/review-diff");
const { POST, MAX_INPUT_CHARS } = await import("./route");

const SOURCE_DIFF = `diff --git a/src/api.ts b/src/api.ts
--- a/src/api.ts
+++ b/src/api.ts
@@ -1 +1 @@
-const limit = 10;
+const limit = 20;`;

const LOCKFILE_DIFF = `diff --git a/package-lock.json b/package-lock.json
--- a/package-lock.json
+++ b/package-lock.json
@@ -1 +1 @@
-"a"
+"b"`;

const REVIEW: Review = {
  summary: "Raises the page size from 10 to 20.",
  changes: [{ file: "src/api.ts", description: "Changes the limit." }],
  risks: [],
  questions: ["Can the database handle larger pages?"],
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.mocked(reviewDiff).mockReset();
});

describe("POST /api/review", () => {
  it("returns the review, usage and file lists", async () => {
    vi.mocked(reviewDiff).mockResolvedValue({
      review: REVIEW,
      usage: { model: "claude-opus-5-5", inputTokens: 100, outputTokens: 50, costUsd: 0.0014, durationMs: 1200 },
    });

    const response = await post({ diff: `${SOURCE_DIFF}\n${LOCKFILE_DIFF}` });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.review).toEqual(REVIEW);
    expect(body.reviewedFiles).toEqual(["src/api.ts"]);
    expect(body.skippedFiles).toEqual(["package-lock.json"]);
    // Only the reviewable part is sent to the model.
    expect(vi.mocked(reviewDiff).mock.calls[0][0]).not.toContain("package-lock.json");
  });

  it.each([
    ["invalid JSON", "{not json"],
    ["a missing diff field", { code: "x" }],
    ["an empty diff", { diff: "   " }],
  ])("rejects %s with 400", async (_, body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(reviewDiff).not.toHaveBeenCalled();
  });

  it("rejects oversized input with 413", async () => {
    const response = await post({ diff: "x".repeat(MAX_INPUT_CHARS + 1) });
    expect(response.status).toBe(413);
  });

  it("returns 422 when every file is skipped", async () => {
    const response = await post({ diff: LOCKFILE_DIFF });
    expect(response.status).toBe(422);
    expect(reviewDiff).not.toHaveBeenCalled();
  });

  it("explains a missing API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const response = await post({ diff: SOURCE_DIFF });
    expect(response.status).toBe(500);
    expect((await response.json()).error).toContain("ANTHROPIC_API_KEY");
  });

  it("returns 422 when the model declines", async () => {
    vi.mocked(reviewDiff).mockRejectedValue(new ReviewRefusedError("declined"));
    expect((await post({ diff: SOURCE_DIFF })).status).toBe(422);
  });

  it("returns 502 when the review is incomplete", async () => {
    vi.mocked(reviewDiff).mockRejectedValue(new ReviewIncompleteError("cut off."));
    expect((await post({ diff: SOURCE_DIFF })).status).toBe(502);
  });

  it("hides unexpected errors behind a generic message", async () => {
    vi.mocked(reviewDiff).mockRejectedValue(new Error("secret internal detail"));
    const response = await post({ diff: SOURCE_DIFF });
    expect(response.status).toBe(500);
    expect((await response.json()).error).not.toContain("secret");
  });
});
