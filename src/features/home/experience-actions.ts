"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";

import {
  createExperienceRecord,
  deleteExperienceRecord,
  getExperienceById,
  updateExperienceRecord,
} from "./experience-queries";
import {
  experienceIdSchema,
  parseExperienceFormData,
  type ExperienceFormState,
  type ExperienceFormValues,
} from "./experience-schema";

function revalidateExperienceSurfaces() {
  revalidatePath("/");
  revalidatePath("/admin/home");
}

function fieldErrors(error: z.ZodError<ExperienceFormValues>) {
  return z.flattenError(error).fieldErrors as ExperienceFormState["errors"];
}

export async function createExperience(
  _previousState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  await requireAdmin();
  const result = parseExperienceFormData(formData);
  if (!result.success)
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(result.error),
    };
  try {
    await createExperienceRecord(result.data);
  } catch {
    return {
      status: "error",
      message: "We could not create this Experience. Please try again.",
    };
  }
  revalidateExperienceSurfaces();
  return { status: "success", message: "Experience created." };
}

export async function updateExperience(
  id: string,
  _previousState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  await requireAdmin();
  const idResult = experienceIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This Experience could not be found." };
  const result = parseExperienceFormData(formData);
  if (!result.success)
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(result.error),
    };
  let existing;
  try {
    existing = await getExperienceById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this Experience. Please try again.",
    };
  }
  if (!existing)
    return { status: "error", message: "This Experience no longer exists." };
  try {
    const updated = await updateExperienceRecord(existing.id, result.data);
    if (!updated)
      return { status: "error", message: "This Experience no longer exists." };
  } catch {
    return {
      status: "error",
      message: "We could not save this Experience. Please try again.",
    };
  }
  revalidateExperienceSurfaces();
  return { status: "success", message: "Experience saved." };
}

export async function deleteExperience(
  id: string,
  previousState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  await requireAdmin();
  void previousState;
  void formData;
  const idResult = experienceIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This Experience could not be found." };
  try {
    const deleted = await deleteExperienceRecord(idResult.data);
    if (!deleted)
      return { status: "error", message: "This Experience no longer exists." };
  } catch {
    return {
      status: "error",
      message: "We could not delete this Experience. Please try again.",
    };
  }
  revalidateExperienceSurfaces();
  return { status: "success", message: "Experience deleted." };
}
