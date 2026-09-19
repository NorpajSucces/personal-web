"use client";

import { useRef, useState, useTransition } from "react";

import { uploadMedia } from "./actions";
import { getMediaUrl } from "./config";

type MediaUploadFieldProps = {
  category: "article" | "note" | "project";
  label: string;
  name: string;
  onChange: (path: string) => void;
  value: string;
};

export function MediaUploadField({
  category,
  label,
  name,
  onChange,
  value,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setMessage("");
    const formData = new FormData();
    formData.set("category", category);
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadMedia(formData);
      setMessage(result.message);
      if (result.status === "success" && result.path) onChange(result.path);
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          className="min-h-10 rounded-md border px-3 text-sm font-medium disabled:cursor-wait disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
        >
          {isPending
            ? "Uploading…"
            : value
              ? `Replace ${label}`
              : `Upload ${label}`}
        </button>
        {value ? (
          <button
            type="button"
            className="min-h-10 rounded-md px-3 text-sm text-destructive"
            onClick={() => {
              onChange("");
              setMessage(`${label} removed from this content.`);
            }}
          >
            Remove
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- private media uses the authenticated proxy route.
        <img
          src={getMediaUrl(value)}
          alt={`${label} preview`}
          className="max-h-72 w-full rounded-md border bg-muted object-contain"
        />
      ) : null}
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {message || "AVIF, GIF, JPEG, PNG, or WebP. Maximum 5 MB."}
      </p>
    </div>
  );
}
