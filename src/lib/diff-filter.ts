/**
 * Decides which changed files are worth sending to the AI reviewer.
 *
 * Lockfiles, build output and binary assets add cost and noise to a review
 * without giving the model anything useful to say, so they are skipped.
 */

const IGNORED_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "Cargo.lock",
  "poetry.lock",
  "composer.lock",
  "Gemfile.lock",
  "go.sum",
]);

const IGNORED_DIRECTORIES = ["node_modules/", "dist/", "build/", ".next/", "vendor/", "coverage/"];

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf",
  ".zip", ".gz", ".woff", ".woff2", ".ttf", ".mp4", ".mp3",
]);

const GENERATED_SUFFIXES = [".min.js", ".min.css", ".map", ".snap"];

export function shouldReviewFile(path: string): boolean {
  const normalised = path.replace(/\\/g, "/");
  const filename = normalised.split("/").pop() ?? normalised;
  const lower = filename.toLowerCase();

  if (IGNORED_FILENAMES.has(filename)) return false;
  if (IGNORED_DIRECTORIES.some((dir) => `/${normalised}`.includes(`/${dir}`))) return false;
  if (GENERATED_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return false;

  const dot = lower.lastIndexOf(".");
  if (dot !== -1 && BINARY_EXTENSIONS.has(lower.slice(dot))) return false;

  return true;
}

export function filterReviewableFiles<T extends { filename: string }>(files: T[]): T[] {
  return files.filter((file) => shouldReviewFile(file.filename));
}
