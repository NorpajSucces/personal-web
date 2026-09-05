"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";

import { upsertHomeContent } from "./queries";
import { homeContentSchema, type HomeFormState } from "./schema";

export async function saveHomeContent(
  _previousState: HomeFormState,
  formData: FormData,
): Promise<HomeFormState> {
  await requireAdmin();

  const result = homeContentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: z.flattenError(result.error).fieldErrors,
    };
  }

  try {
    await upsertHomeContent(result.data);
  } catch {
    return {
      status: "error",
      message: "We could not save your changes. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
  return { status: "success", message: "Home content saved." };
}
