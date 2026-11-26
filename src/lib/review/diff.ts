import { shouldReviewFile } from "@/lib/diff-filter";

export type FilePatch = {
  filename: string;
  patch: string;
};

export type PreparedDiff = {
  /** The diff with skipped files removed: what gets sent to the model */
  reviewableDiff: string;
  reviewedFiles: string[];
  skippedFiles: string[];
};

const FILE_HEADER = /^diff --git a\/(.+) b\/(.+)$/;

/**
 * Splits a `git diff` into one patch per file.
 * Returns an empty array if the text has no `diff --git` headers.
 */
export function splitDiffByFile(diff: string): FilePatch[] {
  const lines = diff.replace(/\r\n/g, "\n").split("\n");
  const patches: FilePatch[] = [];
  let current: { filename: string; lines: string[] } | null = null;

  for (const line of lines) {
    const header = FILE_HEADER.exec(line);
    if (header) {
      if (current) patches.push({ filename: current.filename, patch: current.lines.join("\n") });
      current = { filename: header[2], lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) patches.push({ filename: current.filename, patch: current.lines.join("\n") });

  return patches;
}

/**
 * Removes lockfiles, generated files and binaries from a diff before review.
 * Text without `diff --git` headers (e.g. a hand-made patch) is passed through unchanged.
 */
export function prepareDiff(diff: string): PreparedDiff {
  const patches = splitDiffByFile(diff);

  if (patches.length === 0) {
    return { reviewableDiff: diff.trim(), reviewedFiles: [], skippedFiles: [] };
  }

  const kept: FilePatch[] = [];
  const skippedFiles: string[] = [];
  for (const patch of patches) {
    if (shouldReviewFile(patch.filename)) kept.push(patch);
    else skippedFiles.push(patch.filename);
  }

  return {
    reviewableDiff: kept.map((p) => p.patch).join("\n").trim(),
    reviewedFiles: kept.map((p) => p.filename),
    skippedFiles,
  };
}
