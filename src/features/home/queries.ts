import "server-only";

import { eq, sql } from "drizzle-orm";

import { homeContent } from "@/db/schema/home";

import { toHomeContentValues } from "./defaults";
import type { HomeContentValues } from "./schema";

export async function getHomeContent() {
  // Initialize the connection only at request time, never during build imports.
  const { db } = await import("@/db");
  const [row] = await db
    .select()
    .from(homeContent)
    .where(eq(homeContent.id, 1))
    .limit(1);

  return toHomeContentValues(row);
}

// Called only after server-side authorization and validation in the action.
export async function upsertHomeContent(values: HomeContentValues) {
  const { db } = await import("@/db");
  const content = {
    heroTitle: values.heroTitle,
    heroDescription: values.heroDescription,
    aboutTitle: values.aboutTitle,
    aboutContent: values.aboutContent,
    contactTitle: values.contactTitle,
    contactDescription: values.contactDescription,
    publicEmail: values.publicEmail || null,
    githubUrl: values.githubUrl || null,
    linkedinUrl: values.linkedinUrl || null,
  };

  await db
    .insert(homeContent)
    .values({ id: 1, ...content })
    .onConflictDoUpdate({
      target: homeContent.id,
      set: { ...content, updatedAt: sql`now()` },
    });
}
