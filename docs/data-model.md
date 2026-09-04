# Content & Data Model

## 1. General Publication Model

Content that may be publicly exposed should use explicit publication state and visibility.

### Publication Status

- `draft`
- `published`

### Visibility

- `public`
- `private`

Public rendering rule:

```text
publication_status = published
AND
visibility = public
```

## 2. Article

Fields:

```text
Article
├── id
├── title
├── slug
├── excerpt
├── content (JSONB / Tiptap JSON)
├── coverImage (optional)
├── publicationStatus
├── visibility
├── publishedAt
├── createdAt
└── updatedAt
```

Relations:

- many Topics
- many Tags

Notes:

- Rich content canonical representation is Tiptap JSON.
- `slug` must be unique within Articles.

## 3. Note

Fields:

```text
Note
├── id
├── title
├── slug
├── excerpt
├── content (JSONB / Tiptap JSON)
├── coverImage (optional)
├── publicationStatus
├── visibility
├── publishedAt
├── createdAt
└── updatedAt
```

Relations:

- many Topics
- many Tags

Notes:

- Notes may be personal, technical, journal-like, film-related, book-related, or any other subject.
- `slug` must be unique within Notes.

## 4. Project

Fields:

```text
Project
├── id
├── name
├── slug
├── description
├── screenshot
├── githubUrl (optional)
├── liveDemoUrl (optional)
├── technologies[]
├── projectStatus
│   ├── in_progress
│   └── completed
├── publicationStatus
├── visibility
├── caseStudy (JSONB / optional)
├── createdAt
└── updatedAt
```

Important distinction:

- `projectStatus` = state of the software/project itself.
- `publicationStatus` = state of the portfolio content.

Project technologies remain a PostgreSQL text array in V1.

Case Study is optional and uses Tiptap JSON when present.

## 5. Learning Entry

Fields:

```text
LearningEntry
├── id
├── title
├── description
├── date
├── learningStatus
│   ├── exploring
│   ├── learning
│   └── practicing
├── publicationStatus
├── visibility
├── createdAt
└── updatedAt
```

Relations:

- many Topics
- many related Articles
- many related Notes
- many related Projects

Learning entries do not require a slug or public detail page in V1.

## 6. Topic

Fields:

```text
Topic
├── id
├── name
├── slug
├── createdAt
└── updatedAt
```

Topics are shared across applicable content types.

Examples:

- Technology
- Film
- Books
- Personal
- Learning

## 7. Tag

Fields:

```text
Tag
├── id
├── name
├── slug
├── createdAt
└── updatedAt
```

Tags are shared across Articles and Notes.

Examples:

- PostgreSQL
- Docker
- Sci-Fi
- Christopher Nolan
- Reflection

## 8. Home Content

Fields:

```text
HomeContent
├── heroTitle
├── heroDescription
├── aboutTitle
├── aboutContent
├── contactTitle
├── contactDescription
├── publicEmail
├── githubUrl
├── linkedinUrl
└── updatedAt
```

Home previews are not manually stored as featured references in V1.

Latest Projects, Articles, Notes, and Learning entries are selected automatically from current public content.

## 9. Many-to-Many Relations

Expected junction tables:

```text
article_topics
article_tags

note_topics
note_tags

learning_topics
learning_articles
learning_notes
learning_projects
```

## 10. Rich Content

Canonical storage:

> Tiptap JSON → PostgreSQL `jsonb`

Used by:

- Article content
- Note content
- Project case study

Do not store HTML as a second canonical source of truth.

Rendered HTML/React is derived from the JSON representation.

## 11. Media

Images are stored in Supabase Storage.

Database or rich-text JSON stores references/paths/URLs, not binary image data.

Types include:

- Article cover
- Note cover
- Project screenshot
- Images embedded inside Tiptap content

Private media must not be permanently exposed through public URLs.

## 12. Suggested Database Constraints

Implementation should consider:

- Unique slugs within each content type
- Non-empty required titles/names
- Valid enum/check values for statuses
- Foreign keys for junction tables
- Cascading strategy deliberately chosen for relation cleanup
- Indexes on commonly queried publication/visibility/date fields
- Indexes or uniqueness for Topic/Tag slugs

Exact SQL/Drizzle definitions belong to implementation, but the relational semantics above are part of the specification.
