import { describe, expect, it } from "vitest";
import { filterReviewableFiles, shouldReviewFile } from "./diff-filter";

describe("shouldReviewFile", () => {
  it.each([
    "src/app/page.tsx",
    "lib/utils.py",
    "README.md",
    "packages/api/src/index.ts",
    "src/distance.ts",
  ])("reviews source file %s", (path) => {
    expect(shouldReviewFile(path)).toBe(true);
  });

  it.each([
    "package-lock.json",
    "apps/web/pnpm-lock.yaml",
    "node_modules/react/index.js",
    "dist/bundle.js",
    "packages/ui/build/index.js",
    "public/logo.PNG",
    "assets/app.min.js",
    "src/__snapshots__/page.test.tsx.snap",
  ])("skips %s", (path) => {
    expect(shouldReviewFile(path)).toBe(false);
  });

  it("handles Windows-style paths", () => {
    expect(shouldReviewFile("node_modules\\react\\index.js")).toBe(false);
  });
});

describe("filterReviewableFiles", () => {
  it("keeps only files worth reviewing", () => {
    const files = [
      { filename: "src/api.ts", additions: 10 },
      { filename: "package-lock.json", additions: 900 },
      { filename: "docs/diagram.png", additions: 0 },
    ];
    expect(filterReviewableFiles(files)).toEqual([{ filename: "src/api.ts", additions: 10 }]);
  });
});
