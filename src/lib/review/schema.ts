import {z} from 'zod';


export const RiskSchema = z.object({
    file:z.string().describe("Path of the file the risk is in, as written in the diff."),
    line: z.number().int().nullable().describe("Line number in the new file, or null if not tied to one"),
    severity: z.enum(["high", "medium", "low"]),
    title: z.string().describe("Short name for the problem, under 10 words"),
    explanation: z.string().describe("What could go wrong and why, in plain English"),
});

export const ReviewSchema = z.object({
    summary: z.string().describe("2-4 sentences on what the change does, for someone who has not seen the code"),
    risks: z.array(RiskSchema).describe("Real bugs and security issues only. Empty if there are none."),
    questions: z.array(z.string()).describe("1-5 questions a reviewer should ask the author"),
});

export type Review = z.infer<typeof ReviewSchema>;
