"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";

import {
  createArticleRecord,
  deleteArticleRecord,
  getAdminArticleById,
  isArticleSlugAvailable,
  taxonomySelectionExists,
  updateArticleRecord,
} from "./queries";
import {
  articleIdSchema,
  parseArticleFormData,
  type ArticleFormState,
  type ArticleFormValues,
} from "./schema";

function fieldErrors(error: z.ZodError<ArticleFormValues>) {
  const errors = z.flattenError(error).fieldErrors;
  return {
    ...errors,
    content: errors.content,
  } as ArticleFormState["errors"];
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error && error.code === "23505") return true;
  return "cause" in error && isUniqueViolation(error.cause);
}

function revalidateArticleSurfaces(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  for (const slug of new Set(slugs.filter(Boolean)))
    revalidatePath(`/articles/${slug}`);
}

async function validateArticleInput(
  formData: FormData,
  excludeId?: string,
): Promise<
  | { success: true; data: ArticleFormValues }
  | { success: false; state: ArticleFormState }
> {
  const result = parseArticleFormData(formData);
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
      isArticleSlugAvailable(result.data.slug, excludeId),
      taxonomySelectionExists(result.data.topicIds, result.data.tagIds),
    ]);
    if (!slugAvailable)
      return {
        success: false,
        state: {
          status: "error",
          message: "Please check the highlighted fields.",
          errors: { slug: ["This slug is already used by another Article."] },
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
        message: "We could not validate this Article. Please try again.",
      },
    };
  }
  return { success: true, data: result.data };
}

export async function createArticle(
  _previousState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();
  const validation = await validateArticleInput(formData);
  if (!validation.success) return validation.state;
  let article;
  try {
    article = await createArticleRecord(validation.data);
  } catch (error) {
    if (isUniqueViolation(error))
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { slug: ["This slug is already used by another Article."] },
      };
    return {
      status: "error",
      message: "We could not create this Article. Please try again.",
    };
  }
  revalidateArticleSurfaces([validation.data.slug]);
  redirect(`/admin/articles/${article.id}/edit`);
}

export async function updateArticle(
  id: string,
  _previousState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();
  const idResult = articleIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This Article could not be found." };
  let existing;
  try {
    existing = await getAdminArticleById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this Article. Please try again.",
    };
  }
  if (!existing)
    return { status: "error", message: "This Article no longer exists." };
  const validation = await validateArticleInput(formData, existing.id);
  if (!validation.success) return validation.state;
  try {
    const updated = await updateArticleRecord(existing, validation.data);
    if (!updated)
      return { status: "error", message: "This Article no longer exists." };
  } catch (error) {
    if (isUniqueViolation(error))
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { slug: ["This slug is already used by another Article."] },
      };
    return {
      status: "error",
      message: "We could not save this Article. Please try again.",
    };
  }
  revalidateArticleSurfaces([existing.slug, validation.data.slug]);
  revalidatePath(`/admin/articles/${existing.id}/edit`);
  revalidatePath(`/admin/articles/${existing.id}/preview`);
  return { status: "success", message: "Article saved." };
}

export async function deleteArticle(
  id: string,
  previousState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();
  void previousState;
  void formData;
  const idResult = articleIdSchema.safeParse(id);
  if (!idResult.success)
    return { status: "error", message: "This Article could not be found." };
  let existing;
  try {
    existing = await getAdminArticleById(idResult.data);
  } catch {
    return {
      status: "error",
      message: "We could not load this Article. Please try again.",
    };
  }
  if (!existing)
    return { status: "error", message: "This Article no longer exists." };
  try {
    const deleted = await deleteArticleRecord(existing.id);
    if (!deleted)
      return { status: "error", message: "This Article no longer exists." };
  } catch {
    return {
      status: "error",
      message: "We could not delete this Article. Please try again.",
    };
  }
  revalidateArticleSurfaces([existing.slug]);
  redirect("/admin/articles");
}
