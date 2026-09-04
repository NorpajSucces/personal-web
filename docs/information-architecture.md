# Information Architecture

## 1. Public Sitemap

```text
/
├── Home
│   ├── Hero / Introduction
│   ├── About
│   ├── Latest Projects
│   ├── Latest Articles
│   ├── Latest Notes
│   ├── Latest Learning
│   └── Contact
│
├── /projects
│   └── /projects/:slug
│
├── /articles
│   └── /articles/:slug
│
├── /notes
│   └── /notes/:slug
│
└── /learning
```

No separate `/about` or `/contact` pages are part of V1.

## 2. Public Navigation

Primary navigation:

- Home / Logo
- Projects
- Articles
- Notes
- Learning

About and Contact are reached through Home.

## 3. Home

Home acts as a concise overview, not a single-page replacement for the entire site.

Sections:

1. Hero / Introduction
2. About
3. Latest Projects
4. Latest Articles
5. Latest Notes
6. Latest Learning
7. Contact

Project, Article, Note, and Learning sections show recent content only and provide a route to the corresponding full page.

## 4. Projects

Route:

`/projects`

Purpose:

- simple project listing
- show project status
- show technologies
- link to GitHub when available
- link to live demo when available
- link to project detail when applicable

No search/filter system is required in V1.

Project detail route:

`/projects/:slug`

A project detail can remain simple or contain a full case study.

Recommended case-study structure:

1. Overview
2. Problem
3. Solution
4. Tech Stack
5. Process
6. Challenges
7. Result
8. Lessons Learned
9. GitHub / Live Demo

## 5. Articles

Route:

`/articles`

Contains:

- Article list
- Topics filter
- Tags filter

Article detail:

`/articles/:slug`

V1 detail presentation:

- Title
- Date
- Topics / Tags
- Content

Article URLs remain simple. Topic hierarchy is metadata and does not appear in the URL.

Example:

`/articles/why-i-built-my-digital-home`

not:

`/articles/technology/personal/why-i-built-my-digital-home`

## 6. Notes

Route:

`/notes`

Contains:

- Notes list
- Topics filter
- Tags filter

Note detail:

`/notes/:slug`

V1 detail presentation:

- Title
- Date
- Topics / Tags
- Content

## 7. Learning

Route:

`/learning`

Learning is a chronological journey rather than a skill tree.

Conceptual presentation:

```text
Learning

[Topic / Domain Filter]

2026
├── September
│   ├── Entry
│   └── Entry
├── August
│   └── Entry
└── ...

2025
└── ...
```

Learning entries do not have their own public detail pages in V1.

Entries may reference related:

- Articles
- Notes
- Projects

## 8. Contact

Contact appears on Home.

Direct methods:

- Email
- GitHub
- LinkedIn

Contact form fields:

- Name
- Email
- Message
- Send

## 9. Admin Sitemap

```text
/admin/login

/admin
├── Dashboard
├── Home
├── Projects
├── Articles
├── Notes
├── Learning
└── Topics & Tags
```

## 10. Admin Dashboard

Dashboard is intentionally simple.

Primary role:

> fast entry point for creating and managing content.

Primary content:

- New Article
- New Note
- New Project
- New Learning Entry
- Recent Drafts / recent content if useful

No analytics dashboard is required.

## 11. Admin Content Management

Management pages should support the actions appropriate to the content type:

- Create
- Edit
- Delete
- Preview
- Publish / Unpublish
- Change visibility
- Search/filter management lists when useful

## 12. Topics & Tags

Topics and Tags can be selected or created while editing Articles/Notes.

A secondary management screen should allow cleanup operations such as:

- Rename
- Delete
- Avoid duplicates
- Potential future merge operation

## 13. Admin Preview

Draft/private content must be previewable from admin.

Preview must approximate the public rendering as closely as practical while remaining protected by admin authentication.

## 14. URL Principles

URLs should remain short and human-readable.

Preferred:

- `/articles/:slug`
- `/notes/:slug`
- `/projects/:slug`

Avoid deep taxonomy-driven URLs in V1.
