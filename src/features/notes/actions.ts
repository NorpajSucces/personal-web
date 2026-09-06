"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";

import {
  createNoteRecord,
  deleteNoteRecord,
  getAdminNoteById,
  isNoteSlugAvailable,
  noteTaxonomySelectionExists,
  updateNoteRecord,
} from "./queries";
import {
  noteIdSchema,
  parseNoteFormData,
  type NoteFormState,
  type NoteFormValues,
} from "./schema";

function fieldErrors(error: z.ZodError<NoteFormValues>) {
  const errors = z.flattenError(error).fieldErrors;
  return {
    ...errors,
    content: errors.content,
  } as NoteFormState["errors"];
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error && error.code === "23505") return true;
  return "cause" in error && isUniqueViolation(error.cause);
}

function revalidateNoteSurfaces(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/admin/notes");
  for (const slug of new Set(slugs.filter(Boolean)))
    revalidatePath(`/notes/${slug}`);
}

async function validateNoteInput(
  formData: FormData,
  excludeId?: string,
): Promise<
  | { success: true; data: NoteFormValues }
  | { success: false; state: NoteFormState }
> {
  const result = parseNoteFormData(formData);
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
    const [slugAvailable, taxonomyExists] = await Promise.all([
      isNoteSlugAvailable(result.data.slug, excludeId),
      noteTaxonomySelectionExists(result.data.topicIds, result.data.tagIds),
    ]);
    if (!slugAvailable)
      return {
        success: false,
        state: {
          status: "error",
          message: "Please check the highlighted fields.",
          errors: { slug: ["This slug is already used by another Note."] },
        },
      };
    if (!taxonomyExists)
      return {
        success: false,
        state: {
          status: "error",
          message:
            "A selected Topic or Tag no longer exists. Refresh and try again.",
        },
      };
  } catch {
    return {
      success: false,
      state: {
        status: "error",
        message: "We could not validate this Note. Please try again.",
      },
    };
  }
  return { success: true, data: result.data };
}

export async function createNote(
  _previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  await requireAdmin();
  const validation = await validateNoteInput(formData);
  if (!validation.success) return validation.state;
  let note;
  try {
    note = await createNoteRecord(validation.data);
  } catch (error) {
    if (isUniqueViolation(error))
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { slug: ["This slug is already used by another Note."] },
      };
    return {
      status: "error",
      message: "We could not create this Note. Please try again.",
    };
  }
  revalidateNoteSurfaces([validation.data.slug]);
  redirect(`/admin/notes/${note.id}/edit`);
}

export async function updateNote(
  id: string,
  _previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  await requireAdmin();
  const idResult = noteIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This Note could not be found." };
  let existing;
  try {
    existing = await getAdminNoteById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this Note. Please try again.",
    };
  }
  if (!existing)
    return { status: "error", message: "This Note no longer exists." };
  const validation = await validateNoteInput(formData, existing.id);
  if (!validation.success) return validation.state;
  try {
    const updated = await updateNoteRecord(existing, validation.data);
    if (!updated)
      return { status: "error", message: "This Note no longer exists." };
  } catch (error) {
    if (isUniqueViolation(error))
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { slug: ["This slug is already used by another Note."] },
      };
    return {
      status: "error",
      message: "We could not save this Note. Please try again.",
    };
  }
  revalidateNoteSurfaces([existing.slug, validation.data.slug]);
  revalidatePath(`/admin/notes/${existing.id}/edit`);
  revalidatePath(`/admin/notes/${existing.id}/preview`);
  return { status: "success", message: "Note saved." };
}

export async function deleteNote(
  id: string,
  previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  await requireAdmin();
  void previousState;
  void formData;
  const idResult = noteIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This Note could not be found." };
  let existing;
  try {
    existing = await getAdminNoteById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this Note. Please try again.",
    };
  }
  if (!existing)
    return { status: "error", message: "This Note no longer exists." };
  try {
    const deleted = await deleteNoteRecord(existing.id);
    if (!deleted)
      return { status: "error", message: "This Note no longer exists." };
  } catch {
    return {
      status: "error",
      message: "We could not delete this Note. Please try again.",
    };
  }
  revalidateNoteSurfaces([existing.slug]);
  redirect("/admin/notes");
}
