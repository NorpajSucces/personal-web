"use client";

import { useActionState, useRef } from "react";

import { deleteArticle } from "./actions";
import { initialArticleFormState } from "./schema";

export function DeleteArticleButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = deleteArticle.bind(null, id);
  const [state, formAction, pending] = useActionState(
    action,
    initialArticleFormState,
  );
  return (
    <>
      <button
        type="button"
        className="min-h-10 rounded-md px-3 text-sm text-destructive hover:bg-destructive/10"
        onClick={() => dialogRef.current?.showModal()}
      >
        Delete
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`delete-article-${id}`}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/60"
      >
        <div className="p-6">
          <h2 id={`delete-article-${id}`} className="font-serif text-2xl">
            Delete {title}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This permanently deletes the Article and its Topic/Tag links. Shared
            Topics and Tags are kept. Existing media, if any, is not removed.
          </p>
          <form action={formAction} className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-md bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete Article"}
            </button>
            <button
              type="button"
              disabled={pending}
              className="min-h-11 rounded-md px-4 text-sm text-muted-foreground"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
          </form>
          <p
            role="status"
            aria-live="polite"
            className="mt-3 text-sm text-destructive"
          >
            {state.status === "error" ? state.message : ""}
          </p>
        </div>
      </dialog>
    </>
  );
}
