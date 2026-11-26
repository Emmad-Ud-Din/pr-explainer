import { z } from "zod";

/**
 * The shape every review must have. It is sent to Claude as a JSON schema
 * (structured outputs), so the model can only answer in this format, and the
 * SDK validates the response against it again before we use it.
 */

export const SeveritySchema = z
  .enum(["high", "medium", "low"])
  .describe("high: likely bug or security issue. medium: risky or fragile. low: minor concern.");

export const RiskSchema = z.object({
  file: z.string().describe("Path of the file the risk is in, exactly as it appears in the diff"),
  line: z
    .number()
    .int()
    .nullable()
    .describe("Line number in the new version of the file, or null if the risk is not tied to one line"),
  severity: SeveritySchema,
  title: z.string().describe("Short name for the problem, under 10 words"),
  explanation: z.string().describe("What could go wrong and why, in plain English"),
  suggestion: z.string().describe("A concrete way to fix or reduce the risk"),
});

export const ReviewSchema = z.object({
  summary: z
    .string()
    .describe("2-4 sentences explaining what the change does, for someone who has not seen the code"),
  changes: z
    .array(
      z.object({
        file: z.string(),
        description: z.string().describe("One sentence on what changed in this file"),
      }),
    )
    .describe("One entry per changed file"),
  risks: z
    .array(RiskSchema)
    .describe("Likely bugs, security issues and fragile code. Empty if there are none."),
  questions: z
    .array(z.string())
    .describe("1-5 questions a reviewer should ask the author before approving"),
});

export type Severity = z.infer<typeof SeveritySchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Review = z.infer<typeof ReviewSchema>;
