import type { Risk, Severity } from "@/lib/review/schema";
import type { ReviewSuccessResponse } from "@/lib/review/types";

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

const SEVERITY_STYLES: Record<Severity, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function ReviewResult({ result }: { result: ReviewSuccessResponse }) {
  const { review, usage, skippedFiles } = result;
  const risks = [...review.risks].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <article className="flex flex-col gap-8">
      <Section title="Summary">
        <p className="leading-7">{review.summary}</p>
      </Section>

      <Section title={`Risks (${risks.length})`}>
        {risks.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No likely bugs or security issues found.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {risks.map((risk, index) => (
              <RiskCard key={`${risk.file}-${risk.line}-${index}`} risk={risk} />
            ))}
          </ul>
        )}
      </Section>

      <Section title="What changed">
        <ul className="flex flex-col gap-2">
          {review.changes.map((change) => (
            <li key={change.file} className="leading-7">
              <code className="font-mono text-sm">{change.file}</code>
              <span className="text-zinc-600 dark:text-zinc-400"> — {change.description}</span>
            </li>
          ))}
        </ul>
      </Section>

      {review.questions.length > 0 && (
        <Section title="Questions for the author">
          <ul className="list-disc space-y-2 pl-5 leading-7">
            {review.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </Section>
      )}

      <footer className="flex flex-col gap-1 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          {usage.model} · {usage.inputTokens.toLocaleString("en-US")} in / {usage.outputTokens.toLocaleString("en-US")} out
          tokens · {usage.costUsd === null ? "cost unknown" : `$${usage.costUsd.toFixed(4)}`} ·{" "}
          {(usage.durationMs / 1000).toFixed(1)}s
        </p>
        {skippedFiles.length > 0 && <p>Skipped: {skippedFiles.join(", ")}</p>}
      </footer>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function RiskCard({ risk }: { risk: Risk }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${SEVERITY_STYLES[risk.severity]}`}>
          {risk.severity}
        </span>
        <h3 className="font-semibold">{risk.title}</h3>
      </div>
      <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
        {risk.file}
        {risk.line !== null && `:${risk.line}`}
      </p>
      <p className="leading-7">{risk.explanation}</p>
      <p className="leading-7 text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">Suggestion: </span>
        {risk.suggestion}
      </p>
    </li>
  );
}
