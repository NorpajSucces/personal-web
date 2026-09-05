"use client";

import { useActionState, useRef } from "react";

import { deleteProject } from "./actions";
import { initialProjectFormState } from "./schema";

export function DeleteProjectButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = deleteProject.bind(null, id);
  const [state, formAction, pending] = useActionState(
    action,
    initialProjectFormState,
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
        aria-labelledby={`delete-${id}-title`}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/60"
      >
        <div className="p-6">
          <h2 id={`delete-${id}-title`} className="font-serif text-2xl">
            Delete {name}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This permanently deletes the Project record. Existing uploaded
            media, if any, is not removed in this phase.
          </p>
          <form
            action={formAction}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-md bg-destructive px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete project"}
            </button>
            <button
              type="button"
              disabled={pending}
              className="min-h-11 rounded-md px-4 text-sm text-muted-foreground hover:text-foreground"
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
