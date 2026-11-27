"use client";

import { useState } from "react";
import { ReviewResult } from "./review-result";
import type { Review } from "@/lib/review/schema";


export function ReviewForm() {
    const [diff, setDiff] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Review|null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch("/api/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ diff }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error ?? "Something went wrong");
                return;
            }
            setResult(data.review);
        } catch {
            setError("Could not get a review. Please try again");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <textarea
                value={diff}
                onChange={(event) => setDiff(event.target.value)}
                rows={12}
                className="rounded border p-3 font-mono text-sm"
                placeholder="Paste a git diff here"
            />
            <button
                type="submit"
                disabled={loading || diff.trim() === ""}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
                {loading ? "Reviewing…" : "Review diff"}
            </button>

            {result !== null && 
                 <ReviewResult review={result} />
            }
            {error && (
                <p className="rounded border border-red-300 bg-red-50 p-3 text-red-800">{error}</p>
            )}
        </form>
    );
}
