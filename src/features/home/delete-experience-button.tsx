"use client";

import { useActionState, useEffect, useRef } from "react";

import { deleteExperience } from "./experience-actions";
import { initialExperienceFormState } from "./experience-schema";

export function DeleteExperienceButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(
    deleteExperience.bind(null, id),
    initialExperienceFormState,
  );

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state.status]);

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
        aria-labelledby={`delete-experience-${id}`}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/60"
      >
        <div className="p-6">
          <h2 id={`delete-experience-${id}`} className="font-serif text-2xl">
            Delete {label}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This permanently removes the Experience from Home.
          </p>
          <form action={formAction} className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-md bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete Experience"}
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
