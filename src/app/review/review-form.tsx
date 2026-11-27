"use client";

import { useState } from "react";

export function ReviewForm(){
    const [diff,setDiff]=useState("");
    const [loading,setLoading]=useState(false);
    const [result,setResult]=useState<unknown>(null);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);
        setResult(null);

        const response= await fetch("/api/review", {
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({diff}),
        });
        const data = await response.json();

        setResult(data);
        setLoading(false);
        
    }

    return(
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

      {result !== null && (
        <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}
