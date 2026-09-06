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
pnpm test:auth
pnpm test:home
pnpm test:projects
pnpm test:articles
pnpm test
pnpm build
```

### Admin authentication

Copy `.env.example` to `.env.local` and supply the database connection, public
Supabase URL, public publishable key, and the single administrator's immutable
Supabase Auth user ID. Keep `.env.local` ignored by Git. Never use a secret or
service-role key for this integration.

Supabase must already have a confirmed administrator, custom SMTP, and a Magic
Link email template containing `{{ .Token }}`. The SMTP sender must use a domain
verified with the mail provider. Disable public signup in Supabase;
the login flow additionally uses `shouldCreateUser: false`. Visit `/admin/login`
to request and verify an email code. Supabase handles delivery and rate limits.

For development, Resend's `onboarding@resend.dev` sender can deliver only to the
email address associated with the Resend account. Use a verified domain before
production deployment or sending to other recipients.

Authentication uses request-scoped SSR clients and cookie refresh in
`src/proxy.ts`, scoped to `/admin/*`. Server Components and login verification
check the current Auth user using `getUser()` and compare its ID to the
server-only `ADMIN_USER_ID`. Future mutations must call `requireAdmin()` too.
Admin responses are private and non-cacheable; public pages remain anonymous.

`pnpm test:auth` runs focused tests with Node's built-in test runner, using fake
identities and an Auth test double. Before merging or deploying, also exercise
real email delivery, code verification, admin navigation, and logout against
the configured development project. Home content editing is available at
`/admin/home`, Project management is available at `/admin/projects`, Article
publishing is available at `/admin/articles`, and shared Topics and Tags are
managed at `/admin/taxonomy`. Notes and Learning remain placeholders for later
phases.

### Home CMS development

`/admin/home` edits the singleton Home record using the existing database and
admin environment variables. Before the first save, both pages use the original
Home copy. Saves are immediately public; this configuration has no draft state.
The public Home reads PostgreSQL at request time, not during the build. Database
outages are not treated as an empty record. Latest published and public Projects
and Articles are included; Notes and Learning remain placeholders.

`pnpm test:home` runs validation, mapping, singleton SQL, and Server Action tests
without connecting to Supabase. It uses Node's experimental module-mocking flag
only to isolate server dependencies; production code does not use this feature.

### Projects development

`/admin/projects` provides protected create, edit, preview, and delete workflows.
Projects remain hidden from `/projects`, their public detail route, and the Home
latest-projects section unless both publication status is `published` and
visibility is `public`.

Project screenshots and case-study authoring are intentionally deferred until
the shared Supabase Storage and rich-text foundations are introduced. Existing
database values for those fields are preserved during edits. `pnpm test:projects`
runs focused schema, query-boundary, authorization, and Server Action tests
without connecting to Supabase.

### Articles development

`/admin/articles` provides protected create, edit, preview, and delete workflows
with a shared Tiptap JSON editor and Topic/Tag relationships. Articles appear on
`/articles`, their public detail route, and Home only when publication status is
`published` and visibility is `public`. Public Article filters only expose
taxonomy attached to public content.

The V1 editor supports headings, emphasis, lists, quotes, links, inline and block
code, dividers, tables, callouts, undo/redo, a bubble menu, and a lightweight
slash menu. Rich content is stored only as canonical Tiptap JSON and rendered
through a safe React renderer. Image upload and Supabase Storage integration are
deferred; an existing cover-image path is preserved during edits.

`pnpm test:articles` covers input validation, the rich-text contract, publishing
timestamps, public query boundaries, authorization, mutations, and taxonomy
relationships. `pnpm test` runs all current project suites.

## Project Status

Phase 6 — Articles + Tiptap is complete on `feat/articles` and ready for review.

The protected admin supports Article creation, editing, preview, deletion, and
shared Topic/Tag management. Only published and public Articles render on the
public list, detail pages, filtered views, and Home. Canonical rich content uses
Tiptap JSON with a shared editor contract and safe public renderer.

Next: **Phase 7 — Notes**, following `docs/implementation-plan.md`. Media upload,
Project case-study authoring, Learning, and the Contact submission flow remain
out of scope until their respective phases.
