"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";

import {
  createProjectRecord,
  deleteProjectRecord,
  getAdminProjectById,
  isProjectSlugAvailable,
  updateProjectRecord,
} from "./queries";
import {
  parseProjectFormData,
  projectIdSchema,
  type ProjectFormState,
  type ProjectFormValues,
} from "./schema";

function fieldErrors(error: z.ZodError<ProjectFormValues>) {
  return z.flattenError(error).fieldErrors as ProjectFormState["errors"];
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error && error.code === "23505") return true;
  return "cause" in error && isUniqueViolation(error.cause);
}

function revalidateProjectSurfaces(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/projects/${slug}`);
  }
}

async function validateUniqueSlug(slug: string, excludeId?: string) {
  return isProjectSlugAvailable(slug, excludeId);
}

export async function createProject(
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const result = parseProjectFormData(formData);
  if (!result.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(result.error),
    };
  }
  let slugIsAvailable;
  try {
    slugIsAvailable = await validateUniqueSlug(result.data.slug);
  } catch {
    return {
      status: "error",
      message: "We could not check this slug. Please try again.",
    };
  }
  if (!slugIsAvailable) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: { slug: ["This slug is already used by another project."] },
    };
  }

  let project;
  try {
    project = await createProjectRecord(result.data);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { slug: ["This slug is already used by another project."] },
      };
    }
    return {
      status: "error",
      message: "We could not create this project. Please try again.",
    };
  }

  revalidateProjectSurfaces([result.data.slug]);
  redirect(`/admin/projects/${project.id}/edit`);
}

export async function updateProject(
  id: string,
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const idResult = projectIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This project could not be found." };
  let existing;
  try {
    existing = await getAdminProjectById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this project. Please try again.",
    };
  }
  if (!existing)
    return { status: "error", message: "This project no longer exists." };
  const result = parseProjectFormData(formData);
  if (!result.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(result.error),
    };
  }
  let slugIsAvailable;
  try {
    slugIsAvailable = await validateUniqueSlug(result.data.slug, existing.id);
  } catch {
    return {
      status: "error",
      message: "We could not check this slug. Please try again.",
    };
  }
  if (!slugIsAvailable) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: { slug: ["This slug is already used by another project."] },
    };
  }

  try {
    const updated = await updateProjectRecord(existing.id, result.data);
    if (!updated)
      return { status: "error", message: "This project no longer exists." };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { slug: ["This slug is already used by another project."] },
      };
    }
    return {
      status: "error",
      message: "We could not save this project. Please try again.",
    };
  }

  revalidateProjectSurfaces([existing.slug, result.data.slug]);
  revalidatePath(`/admin/projects/${existing.id}/edit`);
  revalidatePath(`/admin/projects/${existing.id}/preview`);
  return { status: "success", message: "Project saved." };
}

export async function deleteProject(
  id: string,
  previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  void previousState;
  void formData;
  const idResult = projectIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This project could not be found." };
  let existing;
  try {
    existing = await getAdminProjectById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this project. Please try again.",
    };
  }
  if (!existing)
    return { status: "error", message: "This project no longer exists." };

  try {
    const deleted = await deleteProjectRecord(existing.id);
    if (!deleted)
      return { status: "error", message: "This project no longer exists." };
  } catch {
    return {
      status: "error",
      message: "We could not delete this project. Please try again.",
    };
  }

  revalidateProjectSurfaces([existing.slug]);
  redirect("/admin/projects");
}
