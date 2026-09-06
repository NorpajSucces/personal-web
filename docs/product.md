# Product Specification

## 1. Product Vision

The website is a **living personal digital home** that represents work, learning, thoughts, experiments, and growth over time.

It should not feel like a static CV. The long-term identity combines:

- Portfolio
- Personal publishing
- Digital garden
- Learning journey
- Personal knowledge hub

North-star statement:

> Build a living digital home that shows what I build, what I learn, how I think, and how I grow.

## 2. Core Identity

Four ideas define the product:

- **Build** — things I create.
- **Learn** — things I study and explore.
- **Think** — ideas, writing, observations, and reflections.
- **Evolve** — visible growth over time.

Desired personal identity:

- Curious
- Builder-oriented
- Transparent learner
- Thoughtful
- Continuously evolving

The personal brand should emphasize curiosity, learning, building, and reasoning rather than a static list of technologies.

## 3. Product Positioning

Working positioning:

> Portfolio × Personal Publishing × Digital Garden × Learning Journey

The website should be professional enough to support career opportunities but personal enough to include non-technical interests such as books, films, reflections, and other subjects.

## 4. Primary Goals

### Professional Presence

Allow recruiters, hiring managers, and technical reviewers to understand who I am and what I build.

### Proof of Work

Show capability through real projects and engineering case studies instead of skill-rating bars or arbitrary percentages.

### Learning Documentation

Show ongoing learning and development as a chronological journey.

### Personal Knowledge & Publishing

Provide a place to write long-form Articles and lighter Notes across any subject.

### Conversation Opportunities

Make it easy for visitors to reach out through direct contact methods or a contact form.

## 5. Audience

### Primary

- Recruiters / Hiring Managers
- Engineers / Technical Reviewers

### Secondary

- Fellow learners
- People who discover Articles or Notes through shared interests
- Future self

The website should be quickly understandable by a recruiter while offering enough depth for a technical visitor.

## 6. UX Principle: Progressive Depth

Visitors should be able to understand the site quickly, then choose to explore deeper.

Example:

Home → Project → Case Study → related technical context

or:

Home → Article / Note → topic exploration

## 7. Version 1 Public Scope

V1 public navigation:

- Home
- Projects
- Articles
- Notes
- Learning

About and Contact live inside Home.

### Home

Role: overview and gateway.

Contains:

- Hero / Introduction
- About
- Experience
- Tech & Tools
- Latest Projects
- Contact
- Footer

The Hero may remain expressive and wide. The sections after it use a narrower,
centered content column while keeping text left-aligned.

### Projects

Role: proof of work.

Projects are listed simply. Selected projects may contain full case studies.

### Articles

Role: long-form, developed thoughts.

Topics are unrestricted. Examples include technology, books, films, personal reflection, career, culture, or any idea worth exploring deeply.

### Notes

Role: capture thoughts, knowledge, observations, references, reflections, or journal-like entries.

Notes may be short, unfinished, evolving, technical, personal, or miscellaneous.

### Learning

Role: chronological learning journey.

Learning is not a skill-rating page and does not use arbitrary percentages.

### Contact

Lives on Home and provides:

- Email / direct links
- Contact form

## 8. Articles vs Notes vs Learning

### Articles

Articles are developed, intentional, long-form writing.

Question:

> Is this something I want another person to read as a complete piece from beginning to end?

If yes, it is probably an Article.

### Notes

Notes capture something worth remembering, exploring, documenting, or thinking about.

Question:

> Is this something I want to capture now and potentially revisit later?

If yes, it is probably a Note.

Notes do not need to be polished.

### Learning

Learning maps chronological growth. It does not duplicate full explanations contained in Articles or Notes.

## 9. Topic Independence

Content type is not determined by subject.

A film can be:

- a Note: quick thoughts after watching it
- an Article: a developed essay about a theme

A technical concept can be:

- a Note: explanation/reference
- an Article: deeper experience, argument, or reflection

Therefore:

> Form, intention, and depth determine content type — not topic.

## 10. Topics & Tags

Articles and Notes may have:

- multiple Topics
- multiple Tags

Topics represent broader themes.
Tags represent more specific labels.

Example:

Article: `What Interstellar Taught Me About Time and Relationships`

Topics:

- Film
- Personal

Tags:

- Sci-Fi
- Christopher Nolan
- Time
- Relationships
- Reflection

## 11. Publishing Workflow

The product includes a private personal publishing system.

Content states:

### Publication Status

- Draft
- Published

### Visibility

- Public
- Private

Examples:

- Draft + Private → work in progress, admin only
- Published + Public → available to visitors
- Published + Private → finished personal content, admin only

## 12. Admin Product Scope

Only the owner can access admin features.

Admin exists to manage content, not analytics.

Admin should manage:

- Home content
- Experience
- Projects
- Articles
- Notes
- Learning entries
- Topics
- Tags

Admin requirements:

- Create
- Edit
- Delete
- Search/filter management lists where useful
- Preview before publish
- Publish/unpublish
- Public/private visibility
- Upload images from the editor/forms

No media-library page is required in V1.
No visitor analytics dashboard is required in V1.

## 13. Home Content Behavior

Latest Projects on Home are selected automatically from the newest published
and public Projects. Experience entries are ordered automatically by newest
start date. Tech & Tools remains a small code-owned list rather than CMS data.

There is no manual featured-content management in V1.

## 14. Product Principles

- Every page must earn its existence.
- Home provides a focused personal overview without replacing dedicated content pages.
- Show evidence, not self-rating.
- Professional enough to represent me, personal enough to actually be mine.
- Document knowledge as it grows.
- V1 is foundation, not completeness.
- Simple now, extensible later.
- Content and structure should survive visual redesigns.

## 15. Explicitly Out of Scope for V1

Possible future ideas that must not be implemented yet:

- Dedicated Journal
- Timeline / Journey separate from Learning
- Personal Lab
- Uses
- Bookmarks
- Changelog
- Guestbook
- Command Palette
- Terminal Mode
- AI Portfolio Assistant
- Interactive Learning Map
- Multi-author publishing
- Public accounts
