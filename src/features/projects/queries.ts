import "server-only";

import { and, desc, eq, ne } from "drizzle-orm";

import { projects } from "@/db/schema/projects";

import type { ProjectFormValues } from "./schema";

const summaryColumns = {
  id: projects.id,
  name: projects.name,
  slug: projects.slug,
  description: projects.description,
  technologies: projects.technologies,
  projectStatus: projects.projectStatus,
  publicationStatus: projects.publicationStatus,
  visibility: projects.visibility,
  githubUrl: projects.githubUrl,
  liveDemoUrl: projects.liveDemoUrl,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
};

async function getDatabase() {
  return (await import("@/db")).db;
}

export async function getAdminProjects() {
  const db = await getDatabase();
  return db
    .select(summaryColumns)
    .from(projects)
    .orderBy(desc(projects.updatedAt));
}

export async function getAdminProjectById(id: string) {
  const db = await getDatabase();
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return project;
}

export async function isProjectSlugAvailable(slug: string, excludeId?: string) {
  const db = await getDatabase();
  const condition = excludeId
    ? and(eq(projects.slug, slug), ne(projects.id, excludeId))
    : eq(projects.slug, slug);
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(condition)
    .limit(1);
  return !project;
}

export async function createProjectRecord(values: ProjectFormValues) {
  const db = await getDatabase();
  const [project] = await db
    .insert(projects)
    .values({
      ...values,
      githubUrl: values.githubUrl || null,
      liveDemoUrl: values.liveDemoUrl || null,
    })
    .returning({ id: projects.id });
  return project;
}

export async function updateProjectRecord(
  id: string,
  values: ProjectFormValues,
) {
  const db = await getDatabase();
  const [project] = await db
    .update(projects)
    .set({
      ...values,
      githubUrl: values.githubUrl || null,
      liveDemoUrl: values.liveDemoUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return project;
}

export async function deleteProjectRecord(id: string) {
  const db = await getDatabase();
  const [project] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return project;
}

const publicCondition = and(
  eq(projects.publicationStatus, "published"),
  eq(projects.visibility, "public"),
);

export async function getPublicProjects(limit?: number) {
  const db = await getDatabase();
  const query = db
    .select(summaryColumns)
    .from(projects)
    .where(publicCondition)
    .orderBy(desc(projects.updatedAt));
  return limit ? query.limit(limit) : query;
}

export async function getPublicProjectBySlug(slug: string) {
  const db = await getDatabase();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(publicCondition, eq(projects.slug, slug)))
    .limit(1);
  return project;
}
