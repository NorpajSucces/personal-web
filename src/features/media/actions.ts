"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  allowedMediaTypes,
  getMediaExtension,
  MAX_MEDIA_SIZE,
  MEDIA_BUCKET,
} from "./config";

const mediaCategorySchema = z.enum(["article", "editor", "note", "project"]);

export type MediaUploadResult = {
  status: "success" | "error";
  message: string;
  path?: string;
};

export async function uploadMedia(
  formData: FormData,
): Promise<MediaUploadResult> {
  await requireAdmin();

  const categoryResult = mediaCategorySchema.safeParse(
    formData.get("category"),
  );
  const file = formData.get("file");
  if (!categoryResult.success || !(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image to upload." };
  }
  if (file.size > MAX_MEDIA_SIZE) {
    return { status: "error", message: "Images must be 5 MB or smaller." };
  }
  if (
    !allowedMediaTypes.includes(file.type as (typeof allowedMediaTypes)[number])
  ) {
    return {
      status: "error",
      message: "Use an AVIF, GIF, JPEG, PNG, or WebP image.",
    };
  }

  const extension = getMediaExtension(file.type);
  if (!extension) {
    return { status: "error", message: "This image type is not supported." };
  }

  const path = `${categoryResult.data}/${randomUUID()}.${extension}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Media upload failed", { message: error.message });
    return {
      status: "error",
      message: "The image could not be uploaded. Try again.",
    };
  }

  return { status: "success", message: "Image uploaded.", path };
}
