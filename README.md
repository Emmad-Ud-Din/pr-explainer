# PR Explainer

An AI reviewer for GitHub pull requests. It explains what changed in plain English, flags
likely bugs, and suggests questions a reviewer should ask.

> **Status:** early development. See [PLAN.md](./PLAN.md) for the roadmap.

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **Vitest** for unit tests
- **GitHub Actions** for CI
- Planned: Postgres + Drizzle, GitHub App + Octokit, Inngest, Claude API

## Getting started

Requires Node.js 22 or later.

```bash
npm install
cp .env.example .env.local   # fill in values as each phase needs them
npm run dev
```

Then open http://localhost:3000.

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

## Project structure

```
src/
  app/        Next.js routes and UI
  lib/        Core logic (e.g. diff-filter: decides which files are worth reviewing)
.github/
  workflows/  CI
```
