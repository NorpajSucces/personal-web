# Project Decision Log

This file records important decisions and the reasoning behind them. Update it when a significant product, data, design, or architecture decision changes.

---

## DEC-001 — Personal Digital Home Positioning

**Decision:** The product is a personal digital home, not only a portfolio.

**Reason:** It should remain useful beyond a job-search period and represent work, learning, writing, interests, and growth over time.

---

## DEC-002 — Personal Identity Is the Brand

**Decision:** Use the owner's identity as the primary brand rather than inventing a separate product brand for the site.

**Reason:** The site is intended as a long-term personal home.

---

## DEC-003 — V1 Public Navigation

**Decision:** Primary public navigation contains Home, Projects, Articles, Notes, and Learning.

**Reason:** About and Contact are already part of Home, reducing navigation clutter.

---

## DEC-004 — About and Contact Live on Home

**Decision:** No separate `/about` and `/contact` pages in V1.

**Reason:** Home is intended as an overview and gateway, and both sections are concise enough to live there.

---

## DEC-005 — Home Uses Latest Content

**Decision:** Home automatically displays recent Projects, Articles, Notes, and Learning entries.

**Reason:** Avoid manual featured-content management in V1 and make Home evolve automatically with publishing activity.

---

## DEC-006 — Projects Stay Simple

**Decision:** `/projects` is a simple project list without search/filtering in V1.

**Reason:** Current project volume does not justify additional complexity.

---

## DEC-007 — Optional Project Case Studies

**Decision:** Only selected Projects require a full case study.

**Reason:** Not every project deserves or needs a long-form case study.

---

## DEC-008 — Articles vs Notes

**Decision:** Articles and Notes are separated by form/intention/depth, not by topic.

**Reason:** Both may contain technology, books, films, personal thoughts, or other subjects.

---

## DEC-009 — Articles Definition

**Decision:** Articles are developed, intentional, long-form pieces.

---

## DEC-010 — Notes Definition

**Decision:** Notes capture knowledge, thoughts, observations, reflections, references, or journal-like entries and do not need to be polished.

---

## DEC-011 — No Dedicated Journal in V1

**Decision:** Journal-like content may live in Notes.

**Reason:** Avoid creating an additional content system before a real need appears.

---

## DEC-012 — Learning Is Chronological

**Decision:** Learning is a chronological journey with topic/domain filtering.

**Reason:** The product should show progression over time rather than a static skill tree.

---

## DEC-013 — No Skill Percentages

**Decision:** Do not show skill percentages or arbitrary proficiency bars.

**Reason:** Prefer evidence such as projects, notes, and learning history.

---

## DEC-014 — Multiple Topics and Tags

**Decision:** Articles and Notes may have multiple Topics and multiple Tags.

**Reason:** Content may cross multiple themes, and the owner prefers flexible classification.

---

## DEC-015 — Simple URLs

**Decision:** Keep public content URLs shallow, e.g. `/articles/:slug`.

**Reason:** Topics/Tags are metadata and should not make URLs unnecessarily hierarchical.

---

## DEC-016 — Personal Publishing Workflow

**Decision:** Content is managed through a private browser-based admin dashboard rather than primarily through files in the repository.

**Reason:** Owner prefers a Medium/Notion-style publishing workflow.

---

## DEC-017 — Single Admin

**Decision:** V1 supports only one authorized admin.

**Reason:** Multi-author roles and account management are unnecessary complexity.

---

## DEC-018 — Draft and Visibility Are Separate

**Decision:** Content has both publication status (`draft`/`published`) and visibility (`public`/`private`).

**Reason:** Finished content may still be intentionally private.

---

## DEC-019 — Admin Dashboard Focus

**Decision:** Dashboard focuses on content management and quick actions, not analytics.

---

## DEC-020 — No Media Library in V1

**Decision:** Images can be uploaded from content editors/forms, but no separate Media Library UI is required.

---

## DEC-021 — Visual Direction

**Decision:** Modern minimal, warm, dark/caffeine-inspired default with a light alternative and brown/coffee accents.

---

## DEC-022 — Typography Direction

**Decision:** Sans-serif for UI and serif for headings/reading-oriented content.

---

## DEC-023 — Motion Direction

**Decision:** Use subtle animation only.

---

## DEC-024 — Hero Direction

**Decision:** Home hero is text-only in V1.

---

## DEC-025 — Framework

**Decision:** Use Next.js + TypeScript.

**Reason:** The application requires public pages, admin pages, server logic, authentication, database access, and publishing in one cohesive project.

---

## DEC-026 — Modular Monolith

**Decision:** Keep frontend and backend logic in one structured Next.js application.

**Reason:** A separate API/backend would add complexity without a product requirement.

---

## DEC-027 — Styling

**Decision:** Use Tailwind CSS.

---

## DEC-028 — UI Components

**Decision:** Mix shadcn/ui primitives with custom components.

**Reason:** Use proven accessible primitives while preserving a custom public visual identity.

---

## DEC-029 — Database

**Decision:** Use PostgreSQL hosted by Supabase.

---

## DEC-030 — ORM

**Decision:** Use Drizzle ORM rather than Prisma or only the Supabase query client.

**Reason:** Drizzle provides type safety while staying relatively close to SQL and relational concepts.

---

## DEC-031 — Authentication

**Decision:** Use Supabase Auth.

---

## DEC-032 — Admin Login Method

**Decision:** Use passwordless Email OTP.

**Reason:** Appropriate for a single admin and avoids maintaining a reusable password credential for the website.

---

## DEC-033 — Server-Side Authorization

**Decision:** Verify the authenticated Supabase user against the configured authorized admin identity on the server.

**Reason:** Authentication alone is not authorization, and client-side checks are not a security boundary.

---

## DEC-034 — Storage

**Decision:** Use Supabase Storage for uploaded images.

---

## DEC-035 — Rich Text Editor

**Decision:** Use Tiptap.

---

## DEC-036 — Editor Scope

**Decision:** Medium-like rich text plus selected Notion-like features such as slash commands, bubble menu, drag/drop images, tables, and callouts.

**Reason:** Provide a modern authoring experience without building a full Notion clone.

---

## DEC-037 — Rich Content Storage

**Decision:** Tiptap JSON stored as PostgreSQL JSONB is the canonical rich-content representation.

**Reason:** It preserves editor structure and avoids maintaining duplicate HTML and JSON sources of truth.

---

## DEC-038 — Validation

**Decision:** Use Zod for data validation.

---

## DEC-039 — Forms

**Decision:** Use React Hook Form for complex dashboard forms.

---

## DEC-040 — Contact Email

**Decision:** Use Resend for Contact form email delivery.

**Reason:** No need to build an inbox or store Contact messages in PostgreSQL in V1.

---

## DEC-041 — Theme Management

**Decision:** Use next-themes for dark/light switching and CSS/design tokens for visual values.

---

## DEC-042 — Testing

**Decision:** Use Vitest + React Testing Library for unit/component tests and Playwright for high-value E2E flows.

---

## DEC-043 — Package Manager

**Decision:** Use pnpm.

---

## DEC-044 — Code Quality

**Decision:** Use ESLint + Prettier and make lint/typecheck/tests/build part of implementation verification.

---

## DEC-045 — Deployment

**Decision:** Use Vercel for the Next.js application.

---

## DEC-046 — Repository / Development

**Decision:** Use GitHub, VS Code, and Codex with repository documentation as the source of project context.

---

## DEC-047 — No Unnecessary Global State

**Decision:** Do not add Redux/Zustand in V1 unless a real state-management requirement appears.

---

## DEC-048 — Project Technologies as Array

**Decision:** Store Project technologies as a simple text array in V1 rather than a normalized Technology table.

**Reason:** No project filtering or technology pages are required yet.

---

## DEC-049 — Public Data Rule

**Decision:** Public queries only expose `published + public` content.

**Reason:** Draft and private content must remain undiscoverable to visitors.
