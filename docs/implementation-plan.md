# Implementation Plan

## Working Principle

Do not ask Codex to build the whole website in one task.

Implement in small, reviewable phases. Each phase should end in a coherent, working state.

Before each phase:

- Read relevant documentation.
- Create a Git checkpoint/branch.
- Define a small task scope.

After each phase:

- Run lint.
- Run TypeScript checks.
- Run relevant tests.
- Run production build when appropriate.
- Review changed files.
- Commit a working checkpoint.

---

# Phase 0 — Project Bootstrap

Goal: create a clean development foundation without implementing product features yet.

Tasks:

- Initialize Next.js + TypeScript project
- Configure pnpm
- Configure Tailwind CSS
- Configure shadcn/ui
- Configure next-themes
- Configure ESLint + Prettier
- Establish initial `src` organization
- Establish environment variable conventions
- Confirm local dev/build commands
- Add basic CI-quality scripts if appropriate

Exit criteria:

- Application runs locally
- Production build succeeds
- Lint succeeds
- TypeScript succeeds
- Empty public shell works
- Documentation remains present and referenced

---

# Phase 1 — Design System & Public Shell

Goal: establish visual foundation before content-heavy features.

Tasks:

- Implement design tokens
- Implement dark default + light theme
- Set warm/caffeine visual direction
- Configure typography approach
- Build public navigation
- Build page/container primitives
- Build reusable section heading
- Build base card treatments
- Build responsive public shell

Do not implement final content systems yet.

Exit criteria:

- Public shell responsive
- Theme switch works
- Visual direction matches `design.md`
- Components are reusable and minimal

---

# Phase 2 — Database Foundation

Goal: establish database schema and migrations.

Tasks:

- Configure Supabase PostgreSQL connection
- Configure Drizzle
- Create schema for:
  - HomeContent
  - Projects
  - Articles
  - Notes
  - LearningEntries
  - Topics
  - Tags
  - junction tables
- Add constraints and useful indexes
- Create initial migration
- Add typed database access foundation

Exit criteria:

- Migrations run cleanly
- Schema matches `data-model.md`
- Database access is server-side

---

# Phase 3 — Authentication & Admin Shell

Goal: securely establish single-admin access.

Tasks:

- Configure Supabase Auth
- Implement Email OTP login
- Disable/exclude public signup workflow
- Prevent unauthorized user creation through the login flow
- Implement server-side admin authorization
- Protect `/admin`
- Build admin sidebar
- Build simple dashboard quick actions
- Implement logout

Security review:

- `/admin` is safe even if known publicly
- Mutations are not protected only by UI
- Admin identity is checked server-side

Exit criteria:

- Owner can log in through OTP
- Unauthorized visitors cannot access admin
- Admin dashboard shell works

---

# Phase 4 — Home CMS

Goal: make Home editable through admin and render it publicly.

Tasks:

- Home content CRUD/update form
- Hero content
- About content
- Contact content/links
- Public rendering
- Server validation

Latest content sections may initially render empty states until the corresponding systems are built.

---

# Phase 5 — Projects

Goal: full Project management and public display.

Admin:

- Create Project
- Edit Project
- Delete Project
- Draft/published
- Public/private
- Screenshot upload
- GitHub URL
- Live Demo URL
- technologies array
- In Progress / Completed
- Optional Case Study
- Preview

Public:

- Latest Projects on Home
- `/projects`
- `/projects/:slug`
- Full case-study rendering where present

Exit criteria:

- Private/draft projects never appear publicly
- Project images work
- Project detail works for both simple and case-study projects

---

# Phase 6 — Rich Text Foundation + Articles

Goal: implement publishing system and editor foundation.

Editor:

- Tiptap setup
- Core formatting
- Slash commands
- Bubble menu
- Image upload / drag-and-drop
- Table
- Callout
- Code block
- Divider

Article admin:

- Title
- Excerpt
- Content
- Cover image
- Topics
- Tags
- Draft/published
- Public/private
- Publish date
- Slug
- Preview

Public:

- `/articles`
- Topics filtering
- Tags filtering
- `/articles/:slug`

Exit criteria:

- Tiptap JSON persists correctly
- Content renders safely and accurately
- Preview closely matches public rendering
- Draft/private content cannot leak

---

# Phase 7 — Notes

Goal: reuse the publishing foundation for Notes without unnecessarily coupling Article-specific behavior.

Admin fields:

- Title
- Excerpt
- Content
- Optional cover
- Topics
- Tags
- Draft/published
- Public/private
- Publish date
- Slug
- Preview

Public:

- `/notes`
- Topics filtering
- Tags filtering
- `/notes/:slug`

Exit criteria:

- Notes support broad personal/technical topics
- Notes and Articles share infrastructure appropriately without losing semantic distinction

---

# Phase 8 — Learning

Goal: implement chronological learning journey.

Admin:

- Title
- Short description
- Date
- Topics/domains
- Exploring / Learning / Practicing
- Related Articles
- Related Notes
- Related Projects
- Draft/published
- Public/private

Public:

- `/learning`
- Chronological grouping
- Topic/domain filtering
- Related-content links

No Learning detail page in V1.

---

# Phase 8.5 — Home Redesign + Experience CMS

Goal: refine Home into a focused personal profile while preserving the existing
warm editorial identity.

Tasks:

- Keep an expressive, CMS-backed Hero
- Use a narrower centered column after Hero with left-aligned content
- Keep CMS-backed About and Contact content
- Add dedicated Experience schema and protected CRUD under `/admin/home`
- Order Experience automatically by newest start date
- Keep Tech & Tools in one code-owned configuration
- Keep only the newest published and public Projects preview on Home
- Remove Article, Note, and Learning previews from Home without changing their routes
- Add a restrained footer

Exit criteria:

- Home follows Hero → About → Experience → Tech & Tools → Latest Projects → Contact → Footer
- Experience create, edit, delete, validation, and public rendering work
- Current Experience entries have no end date and render `Present`
- Existing Home fields and dedicated public content routes remain functional

---

# Phase 9 — Contact

Goal: production-ready Contact flow.

Tasks:

- Name
- Email
- Message
- Zod validation
- Resend integration
- Success/error feedback
- Basic anti-spam / rate limiting

Do not store messages in the database in V1.

---

# Phase 10 — SEO, Accessibility & Public Polish

Tasks:

- Metadata strategy
- Canonical URLs where applicable
- Sitemap
- Robots configuration
- Open Graph metadata
- Semantic HTML
- Keyboard accessibility
- Focus states
- Contrast review
- Responsive review
- Reduced-motion consideration
- Empty states
- 404 handling

Important:

- Private/draft content must never appear in sitemap or SEO metadata.

---

# Phase 11 — Security Hardening

Review:

- Admin route protection
- Server authorization
- OTP abuse protection
- Rate limits
- Contact form abuse
- Storage policies
- Private media
- Input validation
- Rich-text rendering safety
- Secret/environment variable exposure
- Database permissions / defense-in-depth policies

---

# Phase 12 — Testing

Unit/component:

- Zod schemas
- Slug logic
- Filtering logic
- High-value reusable components

E2E:

Public:

- Home navigation
- Project viewing
- Article filtering + detail
- Note filtering + detail
- Learning browsing
- Contact submission

Admin:

- Authentication boundary
- Create draft
- Preview
- Publish
- Verify public appearance
- Make private
- Verify disappearance from public site

---

# Phase 13 — Deployment

Tasks:

- Create GitHub repository
- Configure Vercel project
- Configure Supabase production project/settings
- Configure Resend
- Add production environment variables
- Apply migrations
- Configure custom domain when ready
- Verify production Auth redirect URLs
- Verify public/private content behavior
- Run smoke tests

Exit criteria:

- Production site available
- Admin login works
- Publishing works
- Images work
- Contact works
- No private/draft content exposure

---

# Codex Task Style

Prefer requests like:

> Implement Phase 3 admin shell according to `/docs/architecture.md` and `/docs/implementation-plan.md`. Do not implement content CRUD yet. Inspect existing code first, make the smallest coherent changes, then run lint, typecheck, and relevant tests.

Avoid requests like:

> Build my entire portfolio website.
