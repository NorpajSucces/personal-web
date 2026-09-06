"use client";

import { useActionState, useRef } from "react";

import { createTaxonomy, deleteTaxonomy, updateTaxonomy } from "./actions";
import {
  initialTaxonomyActionState,
  type TaxonomyActionState,
  type TaxonomyKind,
} from "./schema";

export function TaxonomyCreateForm({ kind }: { kind: TaxonomyKind }) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = createTaxonomy.bind(null, kind);
  const [state, formAction, pending] = useActionState(
    async (previousState: TaxonomyActionState, formData: FormData) => {
      const result = await action(previousState, formData);
      if (result.status === "success") formRef.current?.reset();
      return result;
    },
    initialTaxonomyActionState,
  );
  return (
    <form ref={formRef} action={formAction} className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`create-${kind}`} className="sr-only">
          New {kind} name
        </label>
        <input
          id={`create-${kind}`}
          name="name"
          required
          placeholder={`New ${kind} name`}
          className="min-h-11 min-w-0 flex-1 rounded-md border bg-background px-3 text-base"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Creating…" : `Create ${kind}`}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={`mt-2 text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
      >
        {state.message}
      </p>
    </form>
  );
}

export function TaxonomyEditForm({
  kind,
  id,
  name,
}: {
  kind: TaxonomyKind;
  id: string;
  name: string;
}) {
  const action = updateTaxonomy.bind(null, kind, id);
  const [state, formAction, pending] = useActionState(
    action,
    initialTaxonomyActionState,
  );
  return (
    <form action={formAction} className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <label htmlFor={`edit-${kind}-${id}`} className="sr-only">
          Edit {kind} name
        </label>
        <input
          id={`edit-${kind}-${id}`}
          name="name"
          required
          defaultValue={name}
          className="min-h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 rounded-md border px-3 text-sm font-medium text-primary disabled:opacity-60"
        >
          {pending ? "Saving…" : "Rename"}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={`mt-1 text-xs ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
      >
        {state.message}
      </p>
    </form>
  );
}

export function DeleteTaxonomyButton({
  kind,
  id,
  name,
}: {
  kind: TaxonomyKind;
  id: string;
  name: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = deleteTaxonomy.bind(null, kind, id);
  const [state, formAction, pending] = useActionState(
    action,
    initialTaxonomyActionState,
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
        aria-labelledby={`delete-${kind}-${id}`}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/60"
      >
        <div className="p-6">
          <h3 id={`delete-${kind}-${id}`} className="font-serif text-2xl">
            Delete {name}?
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This removes the shared {kind} and its content relationships. It
            does not delete any Article, Note, or Learning entry.
          </p>
          <form action={formAction} className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-md bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Deleting…" : `Delete ${kind}`}
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
            className="mt-2 text-sm text-destructive"
          >
            {state.status === "error" ? state.message : ""}
          </p>
        </div>
      </dialog>
    </>
  );
}
