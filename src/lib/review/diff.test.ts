import { describe, expect, it } from "vitest";
import { prepareDiff, splitDiffByFile } from "./diff";

const TWO_FILE_DIFF = `diff --git a/src/api.ts b/src/api.ts
index 1111111..2222222 100644
--- a/src/api.ts
+++ b/src/api.ts
@@ -1,3 +1,3 @@
-const limit = 10;
+const limit = 20;
diff --git a/package-lock.json b/package-lock.json
index 3333333..4444444 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1 +1 @@
-"version": "1.0.0"
+"version": "1.0.1"`;

describe("splitDiffByFile", () => {
  it("splits a git diff into one patch per file", () => {
    const patches = splitDiffByFile(TWO_FILE_DIFF);
    expect(patches.map((p) => p.filename)).toEqual(["src/api.ts", "package-lock.json"]);
    expect(patches[0].patch).toContain("+const limit = 20;");
    expect(patches[0].patch).not.toContain("package-lock");
  });

  it("uses the new path for renamed files", () => {
    const patches = splitDiffByFile("diff --git a/old.ts b/new.ts\nsimilarity index 100%");
    expect(patches[0].filename).toBe("new.ts");
  });

  it("handles Windows line endings", () => {
    const patches = splitDiffByFile(TWO_FILE_DIFF.replace(/\n/g, "\r\n"));
    expect(patches).toHaveLength(2);
  });

  it("returns nothing for text without git headers", () => {
    expect(splitDiffByFile("--- a.txt\n+++ b.txt\n+hello")).toEqual([]);
  });
});

describe("prepareDiff", () => {
  it("removes skipped files and reports them", () => {
    const result = prepareDiff(TWO_FILE_DIFF);
    expect(result.reviewedFiles).toEqual(["src/api.ts"]);
    expect(result.skippedFiles).toEqual(["package-lock.json"]);
    expect(result.reviewableDiff).toContain("src/api.ts");
    expect(result.reviewableDiff).not.toContain("package-lock.json");
  });

  it("returns an empty diff when every file is skipped", () => {
    const lockOnly = TWO_FILE_DIFF.slice(TWO_FILE_DIFF.indexOf("diff --git a/package-lock.json"));
    expect(prepareDiff(lockOnly).reviewableDiff).toBe("");
  });

  it("passes through diffs without git headers", () => {
    const plain = "--- a.txt\n+++ b.txt\n+hello";
    expect(prepareDiff(plain)).toEqual({ reviewableDiff: plain, reviewedFiles: [], skippedFiles: [] });
  });
});
