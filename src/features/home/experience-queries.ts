import "server-only";

import { desc, eq } from "drizzle-orm";

import { experiences } from "@/db/schema/experiences";

import type { ExperienceFormValues } from "./experience-schema";

async function getDatabase() {
  return (await import("@/db")).db;
}

export async function getExperiences() {
  const db = await getDatabase();
  return db.select().from(experiences).orderBy(desc(experiences.startDate));
}

export async function getExperienceById(id: string) {
  const db = await getDatabase();
  const [experience] = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, id))
    .limit(1);
  return experience;
}

export async function createExperienceRecord(values: ExperienceFormValues) {
  const db = await getDatabase();
  const [experience] = await db
    .insert(experiences)
    .values({
      ...values,
      endDate: values.isCurrent ? null : values.endDate,
    })
    .returning({ id: experiences.id });
  return experience;
}

export async function updateExperienceRecord(
  id: string,
  values: ExperienceFormValues,
) {
  const db = await getDatabase();
  const [experience] = await db
    .update(experiences)
    .set({
      ...values,
      endDate: values.isCurrent ? null : values.endDate,
      updatedAt: new Date(),
    })
    .where(eq(experiences.id, id))
    .returning({ id: experiences.id });
  return experience;
}

export async function deleteExperienceRecord(id: string) {
  const db = await getDatabase();
  const [experience] = await db
    .delete(experiences)
    .where(eq(experiences.id, id))
    .returning({ id: experiences.id });
  return experience;
}
