"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";

import {
  createTaxonomyRecord,
  deleteTaxonomyRecord,
  findTaxonomyBySlug,
  updateTaxonomyRecord,
} from "./queries";
import {
  parseTaxonomyName,
  taxonomyIdSchema,
  taxonomyKindSchema,
  type TaxonomyActionState,
  type TaxonomyKind,
} from "./schema";

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error && error.code === "23505") return true;
  return "cause" in error && isUniqueViolation(error.cause);
}

function revalidateTaxonomySurfaces() {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/taxonomy");
}

async function createOrFindTaxonomy(kind: TaxonomyKind, name: unknown) {
  const parsed = parseTaxonomyName(name);
  if (!parsed.success)
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Enter a valid name.",
    };
  try {
    const existing = await findTaxonomyBySlug(kind, parsed.data.slug);
    if (existing)
      return {
        status: "success" as const,
        message: `${kind === "topic" ? "Topic" : "Tag"} already exists.`,
        item: { id: existing.id, name: existing.name, slug: existing.slug },
      };
    const item = await createTaxonomyRecord(kind, parsed.data);
    revalidateTaxonomySurfaces();
    return {
      status: "success" as const,
      message: `${kind === "topic" ? "Topic" : "Tag"} created.`,
      item,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      const existing = await findTaxonomyBySlug(kind, parsed.data.slug);
      if (existing)
        return {
          status: "success" as const,
          message: `${kind === "topic" ? "Topic" : "Tag"} already exists.`,
          item: { id: existing.id, name: existing.name, slug: existing.slug },
        };
    }
    return {
      status: "error" as const,
      message: `We could not create this ${kind}. Please try again.`,
    };
  }
}

export async function createInlineTaxonomy(kindValue: string, name: string) {
  await requireAdmin();
  const kind = taxonomyKindSchema.safeParse(kindValue);
  if (!kind.success)
    return { status: "error" as const, message: "Invalid taxonomy type." };
  return createOrFindTaxonomy(kind.data, name);
}

export async function createTaxonomy(
  kindValue: string,
  _previousState: TaxonomyActionState,
  formData: FormData,
): Promise<TaxonomyActionState> {
  await requireAdmin();
  const kind = taxonomyKindSchema.safeParse(kindValue);
  if (!kind.success)
    return { status: "error", message: "Invalid taxonomy type." };
  return createOrFindTaxonomy(kind.data, formData.get("name"));
}

export async function updateTaxonomy(
  kindValue: string,
  id: string,
  _previousState: TaxonomyActionState,
  formData: FormData,
): Promise<TaxonomyActionState> {
  await requireAdmin();
  const kind = taxonomyKindSchema.safeParse(kindValue);
  const idResult = taxonomyIdSchema.safeParse(id);
  const parsed = parseTaxonomyName(formData.get("name"));
  if (!kind.success || !idResult.success)
    return { status: "error", message: "This taxonomy item is invalid." };
  if (!parsed.success)
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Enter a valid name.",
    };
  try {
    const collision = await findTaxonomyBySlug(kind.data, parsed.data.slug);
    if (collision && collision.id !== idResult.data)
      return {
        status: "error",
        message: "That normalized name already exists.",
      };
    const updated = await updateTaxonomyRecord(
      kind.data,
      idResult.data,
      parsed.data,
    );
    if (!updated)
      return {
        status: "error",
        message: "This taxonomy item no longer exists.",
      };
  } catch (error) {
    if (isUniqueViolation(error))
      return {
        status: "error",
        message: "That normalized name already exists.",
      };
    return {
      status: "error",
      message: "We could not save this item. Please try again.",
    };
  }
  revalidateTaxonomySurfaces();
  return { status: "success", message: "Taxonomy item saved." };
}

export async function deleteTaxonomy(
  kindValue: string,
  id: string,
  previousState: TaxonomyActionState,
  formData: FormData,
): Promise<TaxonomyActionState> {
  await requireAdmin();
  void previousState;
  void formData;
  const kind = taxonomyKindSchema.safeParse(kindValue);
  const idResult = taxonomyIdSchema.safeParse(id);
  if (!kind.success || !idResult.success)
    return { status: "error", message: "This taxonomy item is invalid." };
  try {
    const deleted = await deleteTaxonomyRecord(kind.data, idResult.data);
    if (!deleted)
      return {
        status: "error",
        message: "This taxonomy item no longer exists.",
      };
  } catch {
    return {
      status: "error",
      message: "We could not delete this item. Please try again.",
    };
  }
  revalidateTaxonomySurfaces();
  return { status: "success", message: "Taxonomy item deleted." };
}
