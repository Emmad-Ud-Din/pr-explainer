import type { Metadata } from "next";
import Link from "next/link";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "Review a diff · PR Explainer",
  description: "Paste a git diff and get a plain-English explanation and a list of likely bugs.",
};

export default function ReviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-8">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          ← PR Explainer
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Review a diff</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Paste the output of <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">git diff</code>{" "}
          or a pull request&apos;s <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">.diff</code> page.
          Lockfiles, generated files and binaries are skipped automatically.
        </p>
      </header>
      <ReviewForm />
    </main>
  );
}
