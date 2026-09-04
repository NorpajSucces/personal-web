# Architecture

## 1. Architecture Style

Use a **modular monolith** built with Next.js.

Goals:

- one repository
- one deployable application
- clear internal feature boundaries
- avoid unnecessary distributed-system complexity
- retain enough structure for future evolution

## 2. High-Level System

```text
                   Visitor / Admin
                         │
                         ▼
                     Next.js
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Public          Admin          Contact
          │              │              │
          │         Supabase Auth        │
          │          Email OTP           │
          │              │              ▼
          │         Authorization      Resend
          │              │
          └──────────┬───┘
                     │
                Server Logic
                     │
          ┌──────────┼──────────┐
          │          │          │
       Drizzle     Tiptap     Storage
          │                     │
          ▼                     ▼
     PostgreSQL            Supabase
```

## 3. Framework

- Next.js
- TypeScript

Use server-first rendering and data access.

Prefer Server Components unless browser-only interactivity is required.

Client components are appropriate for:

- Theme toggle
- Topics/Tags filtering interactions
- Tiptap editor
- Rich admin forms
- Dialogs/dropdowns
- Other genuine browser-state interactions

Avoid making the whole application client-rendered.

## 4. Database

- PostgreSQL hosted by Supabase
- Drizzle ORM
- Drizzle migrations

Database access should happen from trusted server-side application code.

Do not expose Drizzle or privileged database credentials to the browser.

## 5. Supabase Responsibilities

Supabase provides:

- PostgreSQL hosting
- Authentication
- Storage

Drizzle remains the application database access layer.

Supabase client libraries are used where needed for:

- Auth
- Storage

## 6. Authentication

V1 login:

> Email OTP

Characteristics:

- single authorized admin
- no public registration UI
- unauthorized emails must not silently become valid admin users
- OTP/session managed by Supabase Auth

## 7. Authorization

Authentication does not imply admin authorization.

Server-side authorization must verify the authenticated user against the configured allowed admin identity.

Recommended conceptual flow:

```text
/admin
  ↓
valid session?
  ├── no → login
  └── yes
       ↓
authorized admin identity?
  ├── no → deny
  └── yes → admin
```

The same authorization boundary must protect mutations.

## 8. Public Data Boundary

Every public query must enforce:

```text
publicationStatus = published
visibility = public
```

Draft/private content must not appear in:

- Public detail pages
- Public listing pages
- Homepage latest content
- Related-content results
- SEO metadata
- Sitemap
- Open Graph output
- Public APIs

## 9. Admin Mutations

Conceptual flow:

```text
Admin Browser
     ↓
Server Action / Route Handler
     ↓
Authenticate
     ↓
Authorize Admin
     ↓
Zod Validate
     ↓
Business Logic
     ↓
Drizzle
     ↓
PostgreSQL
```

## 10. Validation

- Zod for data contracts and server validation
- React Hook Form for complex admin forms

Client-side validation improves UX.
Server-side validation is the trust boundary.

## 11. Rich Text

Editor:

- Tiptap

V1 scope:

- Paragraph
- Heading
- Bold / italic / strike
- Bullet / numbered lists
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

Canonical format:

> Tiptap JSON stored in JSONB

Rendering:

- derive React/HTML output from JSON on the server where practical

Do not build full Notion-like block infrastructure in V1.

## 12. Storage

Use Supabase Storage.

Media examples:

- Article cover
- Note cover
- Project screenshot
- Editor image

Separate concerns between public and private media.

Private content must not rely on permanently public media URLs.

## 13. Preview

Admin can preview draft/private content before publishing.

Preview route/component must:

- require admin authorization
- render content using public presentation components where possible
- not make the content publicly discoverable

## 14. Contact Form

Flow:

```text
Visitor
  ↓
Contact Form
  ↓
Zod validation
  ↓
Basic abuse protection
  ↓
Resend
  ↓
Owner email
```

Contact messages are not stored in PostgreSQL in V1.

## 15. Theme Architecture

- Tailwind CSS
- shadcn/ui primitives
- custom public components
- next-themes

Use centralized design tokens/CSS variables so visual identity can be redesigned without rewriting content/data architecture.

## 16. Suggested Code Organization

Conceptual organization:

```text
src/
├── app/
│   ├── (public)/
│   └── admin/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│   ├── home/
│   ├── projects/
│   ├── articles/
│   ├── notes/
│   ├── learning/
│   ├── topics/
│   └── auth/
│
├── db/
│   ├── schema/
│   ├── migrations/
│   └── queries/
│
├── lib/
│   ├── auth/
│   ├── storage/
│   ├── validation/
│   └── email/
│
└── styles/
```

The exact folder structure may evolve during implementation. Preserve the feature boundaries and responsibilities rather than rigidly optimizing for this exact tree.

## 17. Caching / Revalidation

Public content is suitable for caching/revalidation.

Publishing or editing public content should invalidate/revalidate affected public pages.

Authenticated admin routes and session-related responses must not be treated as shared public cacheable responses.

## 18. Security Principles

- Assume `/admin` is discoverable.
- Security must not depend on obscurity.
- Protect routes and mutations server-side.
- Do not expose privileged secrets to the browser.
- Use rate limiting / abuse protection where relevant.
- Protect OTP flows against abuse.
- Keep private media private.
- Validate all external input.
- Encode/render rich text safely.
- Apply database permissions/RLS where useful as defense in depth.
- Use HTTPS in production.

## 19. Testing

### Unit / Component

- Vitest
- React Testing Library

Targets may include:

- Validation schemas
- Slug helpers
- Filtering logic
- Cards/components with meaningful state
- Other isolated business logic

### End-to-End

- Playwright

High-value flows:

Public:

- Navigate Home → Articles → Article
- Filter Articles/Notes by Topic/Tag
- Navigate project and case study
- Submit Contact form

Admin:

- OTP authentication integration where practical
- Create draft
- Preview
- Publish
- Verify public appearance
- Change private/public state

Do not optimize for 100% coverage. Prioritize important behavior.
