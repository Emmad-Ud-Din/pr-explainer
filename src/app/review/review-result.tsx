import type { Review } from "@/lib/review/schema";

const SEVERITY_COLOURS = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-gray-100 text-gray-700"
}

export function ReviewResult({ review }: { review: Review }) {
    return (
        <div className="flex flex-col gap-6">
            <section>
                <h2 className="text-lg font-semibold">Summary</h2>
                <p>{review.summary}</p>
            </section>

            <section>
                <h2 className="text-lg font-semibold">Risks ({review.risks.length})</h2>
                {review.risks.length === 0 ? (
                    <p>No problems found.</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {review.risks.map((risk, index) => (
                            <li key={index} className="rounded border p-4">
                                <span className={`rounded px-2 py-0.5 text-xs font-semibold
                                    uppercase ${SEVERITY_COLOURS[risk.severity]}`}>
                                    {risk.severity}
                                </span>
                                <h3 className="mt-2 font-semibold">{risk.title}</h3>
                                <p className="font-mono text-sm text-gray-500">
                                    {risk.file}{risk.line !== null && `:${risk.line}`}
                                </p>
                                <p className="mt-2">{risk.explanation}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="text-lg font-semibold">Questions for Author</h2>
                <ul className="list-disc pl-5">
                    {review.questions.map((question) => (
                        <li key={question}>{question}</li>
                    ))}
                </ul>
            </section>

        </div>
    )
}
