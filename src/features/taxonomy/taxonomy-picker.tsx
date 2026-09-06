"use client";

import { useState, useTransition } from "react";

import { createInlineTaxonomy } from "./actions";

type TaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

type TaxonomyPickerProps = {
  kind: "topic" | "tag";
  items: TaxonomyOption[];
  selectedIds: string[];
  onItemsChange: (items: TaxonomyOption[]) => void;
  onSelectionChange: (ids: string[]) => void;
};

const inputClassName =
  "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7";

export function TaxonomyPicker({
  kind,
  items,
  selectedIds,
  onItemsChange,
  onSelectionChange,
}: TaxonomyPickerProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const label = kind === "topic" ? "Topics" : "Tags";

  function toggle(id: string) {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  function createItem() {
    startTransition(async () => {
      const result = await createInlineTaxonomy(kind, name);
      setMessage(result.message);
      if (result.status === "success" && result.item) {
        const nextItems = items.some((item) => item.id === result.item?.id)
          ? items
          : [...items, result.item].sort((a, b) =>
              a.name.localeCompare(b.name),
            );
        onItemsChange(nextItems);
        if (!selectedIds.includes(result.item.id))
          onSelectionChange([...selectedIds, result.item.id]);
        setName("");
      }
    });
  }

  return (
    <fieldset className="min-w-0 rounded-lg border p-4">
      <legend className="px-2 text-sm font-semibold">{label}</legend>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <label
              key={item.id}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm has-checked:border-primary has-checked:bg-accent"
            >
              <input
                type="checkbox"
                name={kind === "topic" ? "topicIds" : "tagIds"}
                value={item.id}
                checked={selectedIds.includes(item.id)}
                className="size-4 accent-current"
                onChange={() => toggle(item.id)}
              />
              {item.name}
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} yet.
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`new-${kind}`} className="sr-only">
          New {kind} name
        </label>
        <input
          id={`new-${kind}`}
          value={name}
          placeholder={`New ${kind} name`}
          className={`${inputClassName} flex-1`}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (name.trim()) createItem();
            }
          }}
        />
        <button
          type="button"
          disabled={isPending || !name.trim()}
          className="min-h-11 rounded-md border px-4 text-sm font-medium text-primary disabled:opacity-50"
          onClick={createItem}
        >
          {isPending ? "Adding…" : `Add ${kind}`}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">
        {message}
      </p>
    </fieldset>
  );
}
