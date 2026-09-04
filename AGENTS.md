# AGENTS.md

## Project Context

This repository contains Zhafran's long-term personal website / personal digital home.

It is not intended to be only a portfolio or online CV. It combines professional work, writing, notes, learning history, and personal publishing in one evolving product.

Before making product-level, architectural, data-model, or visual-direction changes, read the relevant files in `/docs`.

## Source of Truth

Use these documents as the primary project specification:

- `/docs/product.md`
- `/docs/information-architecture.md`
- `/docs/design.md`
- `/docs/data-model.md`
- `/docs/architecture.md`
- `/docs/decisions.md`
- `/docs/implementation-plan.md`

If implementation details conflict with these documents, do not silently change the specification. Explain the conflict and propose the smallest reasonable correction.

## Product Principles

- Treat the product as a **personal digital home**, not merely a portfolio template.
- Prefer proof of work over self-rated skills.
- Keep public content easy to understand quickly while supporting deeper exploration.
- Keep V1 focused.
- Do not implement V2/V3 concepts unless explicitly requested.
- Prefer simple solutions over premature abstraction.
- Make decisions that are extensible without designing speculative systems for future features.
- Content and data structure should survive future visual redesigns.

## V1 Public Scope

Public routes:

- `/`
- `/projects`
- `/projects/:slug`
- `/articles`
- `/articles/:slug`
- `/notes`
- `/notes/:slug`
- `/learning`

Home includes About and Contact. Do not create separate `/about` or `/contact` pages unless the specification changes.

## V1 Admin Scope

Admin routes should support:

- Dashboard with quick actions
- Home content editing
- Projects CRUD
- Articles CRUD
- Notes CRUD
- Learning entries CRUD
- Topics & Tags management
- Draft preview
- Public/private visibility
- Draft/published publication status

No analytics dashboard is required in V1.
No media-library page is required in V1.

## Engineering Principles

- Use TypeScript throughout application code.
- Use Next.js as a modular monolith.
- Prefer Server Components by default.
- Use Client Components only when interactivity requires them.
- Keep database access server-side.
- Use Drizzle ORM for PostgreSQL access.
- Validate external input with Zod on the server.
- Use React Hook Form for complex admin forms where appropriate.
- Reuse shadcn/ui primitives where useful, but keep the public visual identity custom.
- Avoid introducing Redux, Zustand, Redis, queues, microservices, or additional infrastructure unless a real requirement appears.
- Do not add dependencies without a concrete need.
- Keep modules cohesive and avoid deep folder nesting without benefit.
- Prefer feature boundaries over arbitrary technical abstractions.

## Authentication & Authorization

- Supabase Auth is used for authentication.
- Admin login uses Email OTP.
- There is only one authorized admin in V1.
- Public signup must not be exposed.
- OTP sign-in must not automatically create unauthorized users.
- Authentication alone does not grant admin access.
- Server-side authorization must verify the authenticated Supabase user against the configured admin identity.
- Never trust client-side admin checks as a security boundary.
- Protect both admin pages and mutation endpoints/actions.

## Public / Private Content Rules

Public content queries must only return records that are both:

- `published`
- `public`

Draft or private content must not leak through public pages, APIs, metadata, feeds, sitemap generation, related-content queries, or previews.

For private or draft content accessed from public routes, prefer a not-found response rather than revealing that private content exists.

Admin preview routes must require valid admin authorization.

## Database Rules

- PostgreSQL is hosted by Supabase.
- Drizzle is the canonical ORM/database layer.
- Use migrations for schema changes.
- Do not reset production data as a migration strategy.
- Maintain proper foreign keys and constraints.
- Articles, Notes, and Learning may have many Topics.
- Articles and Notes may have many Tags.
- Learning entries may relate to Articles, Notes, and Projects.
- Project technologies remain a simple text array in V1 unless requirements change.

## Rich Text

- Tiptap is the rich-text editor.
- Canonical rich-content format is Tiptap JSON stored in PostgreSQL JSONB.
- Do not maintain separate HTML as a second source of truth.
- Render rich content from the canonical JSON representation.
- Treat the Tiptap extension/schema configuration as part of the content contract.

V1 editor scope:

- Paragraph
- Heading
- Bold / italic / strike
- Bullet and numbered lists
- Quote
- Link
- Inline code
- Code block
- Image
- Divider
- Undo / redo
- Slash command
- Bubble menu
- Drag-and-drop image
- Table
- Callout
- Lightweight block interaction

Do not build a full Notion clone in V1.

## Storage

- Use Supabase Storage for uploaded media.
- Store references/paths in structured content or database fields; do not store image binaries inside PostgreSQL content records.
- Public and private media must respect content visibility.
- Do not expose private assets through permanently public URLs.

## UI Direction

Public UI direction:

- Modern minimal
- Warm
- Dark / caffeine-inspired default
- Light theme available
- Brown / coffee accent family
- Sans-serif for UI
- Serif for headings and reading-oriented content
- Medium-width layout
- Thin borders
- Subtle rounded corners
- Subtle animation only
- Text-only hero
- Content-first

Avoid unnecessary gradients, excessive glassmorphism, particle backgrounds, scroll hijacking, excessive 3D effects, or animation that competes with reading.

## Workflow for Each Task

Before implementation:

1. Read the relevant specification.
2. Inspect the existing implementation.
3. Identify the smallest coherent change.
4. Avoid unrelated refactors.

After implementation:

1. Run relevant linting.
2. Run TypeScript checks.
3. Run relevant tests.
4. Run build when the change could affect production compilation.
5. Summarize changed files and important decisions.

## Git / Change Discipline

- Make small, reviewable changes.
- Do not rewrite unrelated areas of the repository.
- Avoid broad formatting-only churn mixed with feature work.
- Preserve existing working behavior unless the task explicitly changes it.

## Out of Scope for V1

Do not implement these unless explicitly requested later:

- Journal as a separate content system
- Timeline / life journey separate from Learning
- Personal Lab
- Uses page
- Bookmarks
- Changelog
- Guestbook
- Command palette
- Terminal mode
- AI portfolio assistant
- Interactive learning map
- Multi-author publishing
- Public user accounts
- Analytics dashboard
- Media library dashboard
