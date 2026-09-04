# Personal Website

A long-term **personal digital home** for documenting what I build, what I learn, what I think about, and how I grow over time.

This project is intentionally more than a traditional portfolio. Version 1 combines a professional portfolio, personal publishing system, learning journey, and evolving knowledge space while keeping the implementation focused and extensible.

## Product Direction

Core ideas:

- Portfolio
- Personal publishing
- Digital garden
- Learning journey
- Personal knowledge hub

North-star statement:

> Build a living digital home that shows what I build, what I learn, how I think, and how I grow.

Product principles:

- Professional enough to represent me, personal enough to actually be mine.
- Content and structure should survive visual redesigns.
- Show evidence, not self-rating.
- Progressive depth: easy to understand at a glance, deeper when someone wants to explore.
- Simple now, extensible later.
- V1 is a foundation, not feature completeness.

## Version 1 Scope

Public website:

- Home
- Projects
- Articles
- Notes
- Learning

Home contains:

- Hero / introduction
- About
- Latest projects
- Latest articles
- Latest notes
- Latest learning entries
- Contact

Private admin area:

- Dashboard
- Home content management
- Projects
- Articles
- Notes
- Learning
- Topics & Tags

## Current Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui + custom components
- next-themes
- PostgreSQL via Supabase
- Drizzle ORM
- Supabase Auth with Email OTP
- Supabase Storage
- Tiptap rich-text editor
- Tiptap JSON stored as PostgreSQL JSONB
- Zod
- React Hook Form
- Resend
- Vitest
- React Testing Library
- Playwright
- pnpm
- ESLint
- Prettier
- GitHub
- Vercel
- VS Code + Codex

## Documentation

Read the project documentation before making product, design, data, or architecture changes:

- `docs/product.md`
- `docs/information-architecture.md`
- `docs/design.md`
- `docs/data-model.md`
- `docs/architecture.md`
- `docs/decisions.md`
- `docs/implementation-plan.md`

Codex and other coding agents should also read `AGENTS.md` before implementation work.

## Development

Requirements:

- Node.js 24.14.0
- pnpm 11.25.0 through Corepack

Install dependencies and start the local development server:

```bash
corepack enable
pnpm install
pnpm dev
```

If the global Corepack shim cannot be enabled, prefix pnpm commands with
`corepack`, for example `corepack pnpm install`.

Quality checks:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

## Project Status

Phase 0 — Project Bootstrap is complete. The next step is **Phase 1 — Design System & Public Shell**, following `docs/implementation-plan.md`.
