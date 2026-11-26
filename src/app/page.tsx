const steps = [
  {
    title: "Open a pull request",
    body: "PR Explainer is installed on your GitHub repo and is told about every new pull request.",
  },
  {
    title: "AI reads the diff",
    body: "Lockfiles and generated files are skipped. The real changes are explained and checked for likely bugs.",
  },
  {
    title: "Review lands as a comment",
    body: "A plain-English summary, flagged risks, and questions a reviewer should ask, posted on the pull request.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 py-16 sm:px-8 sm:py-24">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Work in progress
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">PR Explainer</h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          An AI reviewer for GitHub pull requests. It explains what changed, flags likely bugs, and
          helps reviewers ask the right questions.
        </p>
      </header>

      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">0{index + 1}</span>
            <h2 className="font-semibold">{step.title}</h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{step.body}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
