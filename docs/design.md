# Design Direction

## 1. Visual Identity

Version 1 visual direction:

> Modern minimal, warm, content-first.

The interface should feel personal and comfortable for long-term reading, not corporate, futuristic, or excessively decorative.

## 2. Theme

### Default

Dark / caffeine-inspired.

Conceptual palette direction:

- Background: espresso / charcoal
- Surface: warm dark brown
- Text: warm off-white
- Muted text: taupe / warm gray
- Accent: coffee / caramel / brown

### Alternate

Light theme.

Conceptual palette direction:

- Background: warm cream / off-white
- Surface: subtle beige
- Text: dark brown / charcoal
- Accent: coffee brown

Dark and light modes should feel like the same brand rather than two unrelated themes.

## 3. References

General portfolio references supplied during planning:

- https://portfolio-magicui.vercel.app/
- http://minimal-portfolio-website-template.vercel.app/

Theme references:

- https://21st.dev/@nexfixwork/themes/vintage-paper-remix-1782850400670
- https://21st.dev/@serafimcloud/themes/caffeine

These are references for mood and principles, not templates to copy.

## 4. Typography

Chosen direction:

- Sans-serif for interface/UI
- Serif for headings and reading-oriented content

Typography should carry much of the visual identity.

Priorities:

- Comfortable long-form reading
- Clear hierarchy
- Strong but restrained headings
- Avoid unnecessarily tiny body text

## 5. Layout

Chosen width:

> Medium-width layout — balanced between portfolio showcase and editorial reading.

Guidelines:

- Generous whitespace
- Strong section rhythm
- Avoid excessively wide text columns
- Reading surfaces should remain comfortable for Articles and Notes
- On Home, keep the Hero wide and expressive, then center a noticeably narrower
  profile column with left-aligned text for every following section

## 6. Cards

Chosen direction:

> Minimal cards with thin borders and subtle rounded corners.

Use cards where they improve scanning, particularly for:

- Projects
- Article previews
- Note previews

Avoid heavy shadows and highly elevated surfaces unless a specific interaction needs them.

## 7. Motion

Chosen direction:

> Subtle only.

Suitable examples:

- Light hover movement
- Border/foreground transitions
- Small arrow/link movement
- Gentle content appearance transitions
- Theme transition

Avoid:

- Continuous animation
- Particle backgrounds
- Scroll hijacking
- Excessive parallax
- Custom cursor gimmicks
- Animation on every text element
- Motion that distracts from reading

## 8. Hero

Chosen direction:

> Text-only hero.

The hero should prioritize identity and clarity rather than an illustration, portrait, or interactive visual.

## 9. Homepage Character

Home should feel minimal even though it contains several content sections.

Principle:

> Many useful things, little visual noise.

Conceptual flow:

```text
Hero

About

Experience

Tech & Tools

Latest Projects
→ View all projects

Contact

Footer
```

Experience, Tech & Tools, and Home Projects should favor typography, spacing,
and subtle dividers over large cards or decorative timeline graphics.

Home may use faint vertical rails, small monospace section indexes, and compact
metadata to create a warm editorial-grid character. These details organize the
reading flow; they must remain secondary to content and must not turn the page
into a dense dashboard or imitate a reference site's signature decoration.

## 10. Public vs Admin UI

### Public

Custom visual identity should dominate.

### Admin

Can rely more heavily on shadcn/ui primitives for speed, consistency, accessibility, and form-heavy interactions.

The public site should not look like a default shadcn dashboard.

## 11. Design System Principle

Use design tokens for:

- Background
- Foreground
- Surface
- Muted
- Border
- Accent
- Typography
- Radius
- Spacing

Important principle:

> Content and structure should survive visual redesigns.

Future redesigns should ideally change tokens and presentation components rather than require major data or application rewrites.
