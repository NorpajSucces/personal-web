import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { articles } from "@/db/schema/articles";
import { notes } from "@/db/schema/notes";
import { projects } from "@/db/schema/projects";

const publicArticle = and(
  eq(articles.publicationStatus, "published"),
  eq(articles.visibility, "public"),
);
const publicNote = and(
  eq(notes.publicationStatus, "published"),
  eq(notes.visibility, "public"),
);
const publicProject = and(
  eq(projects.publicationStatus, "published"),
  eq(projects.visibility, "public"),
);

async function getDatabase() {
  return (await import("@/db")).db;
}

function contentReferencesPath(
  column: typeof articles.content | typeof notes.content,
  path: string,
) {
  return sql`jsonb_path_exists(
    ${column},
    '$.** ? (@.type == "image" && @.attrs.path == $path)',
    jsonb_build_object('path', to_jsonb(${path}::text))
  )`;
}

export async function isMediaPubliclyReferenced(path: string) {
  const db = await getDatabase();
  const [projectRows, articleRows, noteRows] = await Promise.all([
    db
      .select({ id: projects.id })
      .from(projects)
      .where(and(publicProject, eq(projects.screenshotPath, path)))
      .limit(1),
    db
      .select({ id: articles.id })
      .from(articles)
      .where(
        and(
          publicArticle,
          sql`(${articles.coverImagePath} = ${path} or ${contentReferencesPath(articles.content, path)})`,
        ),
      )
      .limit(1),
    db
      .select({ id: notes.id })
      .from(notes)
      .where(
        and(
          publicNote,
          sql`(${notes.coverImagePath} = ${path} or ${contentReferencesPath(notes.content, path)})`,
        ),
      )
      .limit(1),
  ]);

  return (
    projectRows.length > 0 || articleRows.length > 0 || noteRows.length > 0
  );
}
