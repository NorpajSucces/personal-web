"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";

import {
  createLearningEntryRecord,
  deleteLearningEntryRecord,
  getAdminLearningEntryById,
  learningSelectionExists,
  updateLearningEntryRecord,
} from "./queries";
import {
  learningEntryIdSchema,
  parseLearningFormData,
  type LearningFormState,
  type LearningFormValues,
} from "./schema";

function fieldErrors(error: z.ZodError<LearningFormValues>) {
  return z.flattenError(error).fieldErrors as LearningFormState["errors"];
}

function revalidateLearningSurfaces() {
  revalidatePath("/");
  revalidatePath("/learning");
  revalidatePath("/admin/learning");
}

async function validateLearningInput(
  formData: FormData,
): Promise<
  | { success: true; data: LearningFormValues }
  | { success: false; state: LearningFormState }
> {
  const result = parseLearningFormData(formData);
  if (!result.success)
    return {
      success: false,
      state: {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: fieldErrors(result.error),
      },
    };
  try {
    if (!(await learningSelectionExists(result.data)))
      return {
        success: false,
        state: {
          status: "error",
          message:
            "A selected Topic or related item no longer exists. Refresh and try again.",
        },
      };
  } catch {
    return {
      success: false,
      state: {
        status: "error",
        message: "We could not validate this Learning entry. Please try again.",
      },
    };
  }
  return { success: true, data: result.data };
}

export async function createLearningEntry(
  _previousState: LearningFormState,
  formData: FormData,
): Promise<LearningFormState> {
  await requireAdmin();
  const validation = await validateLearningInput(formData);
  if (!validation.success) return validation.state;
  let entry;
  try {
    entry = await createLearningEntryRecord(validation.data);
  } catch {
    return {
      status: "error",
      message: "We could not create this Learning entry. Please try again.",
    };
  }
  revalidateLearningSurfaces();
  redirect(`/admin/learning/${entry.id}/edit`);
}

export async function updateLearningEntry(
  id: string,
  _previousState: LearningFormState,
  formData: FormData,
): Promise<LearningFormState> {
  await requireAdmin();
  const idResult = learningEntryIdSchema.safeParse(id);
  if (!idResult.success)
    return {
      status: "error",
      message: "This Learning entry could not be found.",
    };
  let existing;
  try {
    existing = await getAdminLearningEntryById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this Learning entry. Please try again.",
    };
  }
  if (!existing)
    return {
      status: "error",
      message: "This Learning entry no longer exists.",
    };
  const validation = await validateLearningInput(formData);
  if (!validation.success) return validation.state;
  try {
    const updated = await updateLearningEntryRecord(existing, validation.data);
    if (!updated)
      return {
        status: "error",
        message: "This Learning entry no longer exists.",
      };
  } catch {
    return {
      status: "error",
      message: "We could not save this Learning entry. Please try again.",
    };
  }
  revalidateLearningSurfaces();
  revalidatePath(`/admin/learning/${existing.id}/edit`);
  revalidatePath(`/admin/learning/${existing.id}/preview`);
  return { status: "success", message: "Learning entry saved." };
}

export async function deleteLearningEntry(
  id: string,
  previousState: LearningFormState,
  formData: FormData,
): Promise<LearningFormState> {
  await requireAdmin();
  void previousState;
  void formData;
  const idResult = learningEntryIdSchema.safeParse(id);
  if (!idResult.success)
    return {
      status: "error",
      message: "This Learning entry could not be found.",
    };
  let existing;
  try {
    existing = await getAdminLearningEntryById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this Learning entry. Please try again.",
    };
  }
  if (!existing)
    return {
      status: "error",
      message: "This Learning entry no longer exists.",
    };
  try {
    const deleted = await deleteLearningEntryRecord(existing.id);
    if (!deleted)
      return {
        status: "error",
        message: "This Learning entry no longer exists.",
      };
  } catch {
    return {
      status: "error",
      message: "We could not delete this Learning entry. Please try again.",
    };
  }
  revalidateLearningSurfaces();
  redirect("/admin/learning");
}
