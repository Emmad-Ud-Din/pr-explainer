# PR Explainer

An AI reviewer for GitHub pull requests. It explains what changed in plain English, flags
likely bugs, and suggests questions a reviewer should ask.

> **Status:** early development. See [PLAN.md](./PLAN.md) for the roadmap.

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **Vitest** for unit tests
- **GitHub Actions** for CI
- **Claude API** (`@anthropic-ai/sdk`) with structured outputs validated by **Zod**
- Planned: Postgres + Drizzle, GitHub App + Octokit, Inngest

## Getting started

Requires Node.js 22 or later.

```bash
npm install
cp .env.example .env.local   # fill in values as each phase needs them
npm run dev
```

Then open http://localhost:3000 and go to **Review a diff**.

To run real reviews, add a Claude API key from https://console.anthropic.com to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Each review costs roughly $0.01–$0.10 depending on the size of the diff. Set a monthly spending
limit in the Anthropic Console before deploying, because anyone who finds the deployed `/review`
page can use it.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |

CI runs lint, type check, tests and build on every push to `main` and every pull request.

## How a review works

1. The diff is split per file, and lockfiles, generated files and binaries are dropped.
2. The rest is sent to Claude with a system prompt and wrapped in randomly named tags, so text
   inside the diff can't pose as instructions (prompt injection defence).
3. Claude must answer in a fixed JSON shape (summary, changes, risks, questions), defined once in
   `src/lib/review/schema.ts` with Zod and validated again before use.
4. Token usage and estimated cost are logged for every review. The diff itself is never logged.

## Project structure

```
src/
  app/
    review/       Paste-a-diff page
    api/review/   POST endpoint: validates input, calls Claude, returns the review
  lib/
    diff-filter.ts  Decides which files are worth reviewing
    review/         Prompt, output schema, diff splitting, cost estimates, Claude call
.github/
  workflows/  CI
```
