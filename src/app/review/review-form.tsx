"use client";

import { useEffect, useState } from "react";
import type { ReviewErrorResponse, ReviewSuccessResponse } from "@/lib/review/types";
import { ReviewResult } from "./review-result";
import { SAMPLE_DIFF } from "./sample-diff";

type State =
  | { status: "idle" }
  | { status: "loading"; startedAt: number }
  | { status: "error"; message: string }
  | { status: "done"; result: ReviewSuccessResponse };

export function ReviewForm() {
  const [diff, setDiff] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const isLoading = state.status === "loading";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!diff.trim() || isLoading) return;

    setState({ status: "loading", startedAt: Date.now() });
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ diff }),
      });
      const body = (await response.json().catch(() => null)) as ReviewSuccessResponse | ReviewErrorResponse | null;

      if (!response.ok || !body || "error" in body) {
        const message = body && "error" in body ? body.error : `Request failed (${response.status}).`;
        setState({ status: "error", message });
        return;
      }
      setState({ status: "done", result: body });
    } catch {
      setState({ status: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <label htmlFor="diff" className="font-medium">
            Diff
          </label>
          <button
            type="button"
            onClick={() => setDiff(SAMPLE_DIFF)}
            disabled={isLoading}
            className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Load an example
          </button>
        </div>
        <textarea
          id="diff"
          value={diff}
          onChange={(event) => setDiff(event.target.value)}
          disabled={isLoading}
          spellCheck={false}
          wrap="off"
          placeholder={"diff --git a/src/app.ts b/src/app.ts\n..."}
          className="min-h-72 w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
        />
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isLoading || !diff.trim()}
            className="h-11 rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isLoading ? "Reviewing…" : "Review diff"}
          </button>
          {state.status === "loading" && <ElapsedTime startedAt={state.startedAt} />}
        </div>
      </form>

      <div aria-live="polite">
        {state.status === "error" && (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {state.message}
          </p>
        )}
        {state.status === "done" && <ReviewResult result={state.result} />}
      </div>
    </div>
  );
}

function ElapsedTime({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = Math.floor((now - startedAt) / 1000);
  return (
    <span className="text-sm text-zinc-500 dark:text-zinc-400">
      {seconds}s · reviews usually take 15–60 seconds
    </span>
  );
}
