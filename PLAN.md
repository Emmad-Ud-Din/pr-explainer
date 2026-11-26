# Build Plan

An AI reviewer for GitHub pull requests: it explains what changed, flags likely bugs and
suggests questions for reviewers. About 8 weeks at roughly 10 hours a week.

## Stack

| Part | Choice | Why |
|---|---|---|
| Frontend + backend | Next.js (TypeScript) + Tailwind | One codebase for UI and API routes |
| Database | Postgres (Neon or Supabase) + Drizzle ORM | Industry standard, type-safe queries |
| GitHub connection | GitHub App + Octokit | How real review tools connect to GitHub |
| Background jobs | Inngest | GitHub expects a webhook answered within 10 seconds; a review takes longer |
| AI | Claude API (`@anthropic-ai/sdk`) with structured outputs | Reviews come back as validated JSON |
| Hosting | Vercel | Free and fast to deploy |
| Local webhooks | smee.io | Forwards GitHub events to your laptop |

## Phase 0: Setup (week 1)

- [x] Next.js + TypeScript + Tailwind
- [x] Vitest with a first unit test
- [x] GitHub Actions CI: lint, type-check, test, build
- [ ] Deploy to Vercel and add the live URL to the README

**Done when:** a live URL and a green CI check.

## Phase 1: The AI core, no GitHub yet (weeks 1–2)

- [x] Page where you paste a diff (`/review`)
- [x] API route that sends the diff to Claude and returns structured JSON (`/api/review`):
  - plain-English summary
  - risks: file, line, severity, explanation
  - questions a reviewer should ask
- [x] Validate the response with Zod; handle errors and slow responses in the UI
- [x] Log tokens used and cost per review
- [x] Prompt injection defence: diff wrapped in randomly named tags and treated as data
- [ ] Try it on 5–10 real diffs from your own projects and tune the prompt

**Done when:** pasting a real diff gives a useful, consistently formatted review.

## Phase 2: GitHub integration (weeks 3–4)

- [ ] Create a GitHub App (permissions: read contents, write pull request comments)
- [ ] Sign in with GitHub and an install flow for choosing repos
- [ ] Webhook endpoint for pull requests being opened or updated, with **signature verification**
- [ ] Fetch the diff and post the review back as a pull request comment
- [ ] Database tables: `users`, `installations`, `repos`, `reviews`
  (pull request number, commit SHA, status, result, cost)

**Done when:** opening a pull request on your own repo gets an AI comment automatically.

## Phase 3: Reliability (week 5)

- [ ] Webhook queues a background job and responds immediately; the job retries on failure
- [ ] No duplicate work: the same commit SHA is never reviewed twice
- [x] Skip lockfiles, generated files and binaries (`src/lib/diff-filter.ts`)
- [ ] Split very large pull requests into chunks
- [ ] Prompt injection defence: treat all diff text as untrusted data, never as instructions

**Done when:** a 50-file pull request works and a failed job retries cleanly.

## Phase 4: Dashboard (week 6)

- [ ] Connected repos and review history
- [ ] Per-repo settings: ignored paths, strictness, on/off
- [ ] Cost totals per repo and per month

**Done when:** a user can manage everything without touching GitHub settings.

## Phase 5: Evaluation (week 7)

- [ ] 20–30 small pull requests with deliberately planted bugs, plus a few clean ones
- [ ] Script that runs the reviewer on all of them and measures:
  - **catch rate:** planted bugs found
  - **false positives:** complaints about clean code
- [ ] Run it on every prompt change; keep a results table in the README

**Done when:** you can show measured improvement, e.g. catch rate from 55% to 80%.

## Phase 6: Polish and launch (week 8)

- [ ] README with demo GIF, architecture diagram, eval results and design decisions
- [ ] Install on friends' or classmates' repos: 5–10 real users
- [ ] Write CV bullets

## Optional extras

- Comments on the exact line of code instead of one big comment
- "Explain for a newcomer" mode
- Re-review only what changed since the last review

## Things to keep in mind

- **Cost:** set a monthly spending limit in the Anthropic Console before connecting real repos.
- **Secrets:** API keys and the GitHub App private key live in environment variables
  (see `.env.example`), never in the repo. Don't log people's code.
- **Phase 2 is the hardest part.** Webhooks and GitHub App authentication are confusing at
  first; taking twice as long as planned is normal.
