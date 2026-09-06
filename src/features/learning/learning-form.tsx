"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { TaxonomyPicker } from "@/features/taxonomy/taxonomy-picker";

import { RelatedContentPicker } from "./related-content-picker";
import {
  initialLearningFormState,
  type LearningFormField,
  type LearningFormState,
} from "./schema";
import type { LearningRelationOptions, TaxonomyOption } from "./types";

export type LearningFormInitialValues = {
  title: string;
  description: string;
  date: string;
  learningStatus: "exploring" | "learning" | "practicing";
  publicationStatus: "draft" | "published";
  visibility: "private" | "public";
  topicIds: string[];
  articleIds: string[];
  noteIds: string[];
  projectIds: string[];
};

type LearningFormProps = {
  action: (
    state: LearningFormState,
    formData: FormData,
  ) => Promise<LearningFormState>;
  initialValues: LearningFormInitialValues;
  initialTopics: TaxonomyOption[];
  relationOptions: LearningRelationOptions;
  mode: "create" | "edit";
};

const inputClassName =
  "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7 aria-invalid:border-destructive";

export const newLearningValues: LearningFormInitialValues = {
  title: "",
  description: "",
  date: "",
  learningStatus: "exploring",
  publicationStatus: "draft",
  visibility: "private",
  topicIds: [],
  articleIds: [],
  noteIds: [],
  projectIds: [],
};

export function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function FieldError({
  field,
  error,
}: {
  field: LearningFormField;
  error?: string;
}) {
  return error ? (
    <p id={`${field}-error`} className="text-sm text-destructive">
      {error}
    </p>
  ) : null;
}

export function LearningForm({
  action,
  initialValues,
  initialTopics,
  relationOptions,
  mode,
}: LearningFormProps) {
  const [values, setValues] = useState(initialValues);
  const [topics, setTopics] = useState(initialTopics);
  const [state, formAction, pending] = useActionState(
    action,
    initialLearningFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.errors) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  function updateValue(
    field:
      | "title"
      | "description"
      | "date"
      | "learningStatus"
      | "publicationStatus"
      | "visibility",
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateSelection(
    field: "topicIds" | "articleIds" | "noteIds" | "projectIds",
    ids: string[],
  ) {
    setValues((current) => ({ ...current, [field]: ids }));
  }

  function errorProps(field: LearningFormField) {
    const errors = state.errors?.[field];
    return {
      "aria-invalid": Boolean(errors?.length),
      "aria-describedby": errors?.length ? `${field}-error` : undefined,
    };
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="space-y-8"
    >
      <fieldset
        disabled={pending}
        className="min-w-0 space-y-6 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Learning details</legend>
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            {...errorProps("title")}
            id="title"
            name="title"
            value={values.title}
            required
            autoFocus={mode === "create"}
            className={inputClassName}
            onChange={(event) => updateValue("title", event.target.value)}
          />
          <FieldError field="title" error={state.errors?.title?.[0]} />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            {...errorProps("description")}
            id="description"
            name="description"
            value={values.description}
            required
            rows={5}
            className={inputClassName}
            onChange={(event) => updateValue("description", event.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Keep this concise. Longer explanations belong in related Articles or
            Notes.
          </p>
          <FieldError
            field="description"
            error={state.errors?.description?.[0]}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              {...errorProps("date")}
              id="date"
              name="date"
              type="date"
              value={values.date}
              required
              className={inputClassName}
              onChange={(event) => updateValue("date", event.target.value)}
            />
            <FieldError field="date" error={state.errors?.date?.[0]} />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="learningStatus"
              className="block text-sm font-medium"
            >
              Learning status
            </label>
            <select
              {...errorProps("learningStatus")}
              id="learningStatus"
              name="learningStatus"
              value={values.learningStatus}
              className={inputClassName}
              onChange={(event) =>
                updateValue("learningStatus", event.target.value)
              }
            >
              <option value="exploring">Exploring</option>
              <option value="learning">Learning</option>
              <option value="practicing">Practicing</option>
            </select>
            <p className="text-sm text-muted-foreground">
              This describes the learning stage, not a competency score.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset
        disabled={pending}
        className="min-w-0 space-y-5 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Topics</legend>
        <p className="text-sm leading-6 text-muted-foreground">
          Use shared Topics as broad domains. Learning does not use Tags.
        </p>
        <TaxonomyPicker
          kind="topic"
          items={topics}
          selectedIds={values.topicIds}
          onItemsChange={setTopics}
          onSelectionChange={(ids) => updateSelection("topicIds", ids)}
        />
      </fieldset>

      <fieldset
        disabled={pending}
        className="min-w-0 space-y-5 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Related content</legend>
        <p className="text-sm leading-6 text-muted-foreground">
          Draft or private content can be related here. Public Learning only
          reveals related content that is both Published and Public.
        </p>
        <div className="grid gap-5 lg:grid-cols-3">
          <RelatedContentPicker
            label="Articles"
            name="articleIds"
            items={relationOptions.articles}
            selectedIds={values.articleIds}
            onSelectionChange={(ids) => updateSelection("articleIds", ids)}
          />
          <RelatedContentPicker
            label="Notes"
            name="noteIds"
            items={relationOptions.notes}
            selectedIds={values.noteIds}
            onSelectionChange={(ids) => updateSelection("noteIds", ids)}
          />
          <RelatedContentPicker
            label="Projects"
            name="projectIds"
            items={relationOptions.projects}
            selectedIds={values.projectIds}
            onSelectionChange={(ids) => updateSelection("projectIds", ids)}
          />
        </div>
      </fieldset>

      <fieldset
        disabled={pending}
        className="min-w-0 space-y-5 rounded-lg border bg-card p-5 disabled:opacity-75 sm:p-6"
      >
        <legend className="px-2 font-serif text-2xl">Publishing</legend>
        <p className="text-sm leading-6 text-muted-foreground">
          A Learning entry appears publicly only when it is both Published and
          Public.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="publicationStatus"
              className="block text-sm font-medium"
            >
              Publication status
            </label>
            <select
              {...errorProps("publicationStatus")}
              id="publicationStatus"
              name="publicationStatus"
              value={values.publicationStatus}
              className={inputClassName}
              onChange={(event) =>
                updateValue("publicationStatus", event.target.value)
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="visibility" className="block text-sm font-medium">
              Visibility
            </label>
            <select
              {...errorProps("visibility")}
              id="visibility"
              name="visibility"
              value={values.visibility}
              className={inputClassName}
              onChange={(event) =>
                updateValue("visibility", event.target.value)
              }
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create Learning Entry"
              : "Save Learning Entry"}
        </button>
        <Link
          href="/admin/learning"
          className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {pending ? "Saving your Learning entry…" : state.message}
        </p>
      </div>
    </form>
  );
}
