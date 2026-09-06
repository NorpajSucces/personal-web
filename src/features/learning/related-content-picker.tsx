"use client";

import { useId, useState } from "react";

import type { RelatedContent } from "./types";

type RelatedContentPickerProps = {
  label: string;
  name: "articleIds" | "noteIds" | "projectIds";
  items: RelatedContent[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
};

export function RelatedContentPicker({
  label,
  name,
  items,
  selectedIds,
  onSelectionChange,
}: RelatedContentPickerProps) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const visibleItems = query
    ? items.filter((item) => item.title.toLocaleLowerCase().includes(query))
    : items;

  function toggle(id: string) {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <fieldset className="min-w-0 rounded-lg border p-4">
      <legend className="px-2 text-sm font-semibold">{label}</legend>
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      {items.length ? (
        <>
          <label htmlFor={searchId} className="sr-only">
            Search {label.toLocaleLowerCase()}
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            placeholder={`Search ${label.toLocaleLowerCase()}`}
            className="mb-3 block min-h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => setSearch(event.target.value)}
          />
          {visibleItems.length ? (
            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {visibleItems.map((item) => (
                <label
                  key={item.id}
                  className="flex min-h-10 cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    className="mt-0.5 size-4 shrink-0 accent-current"
                    onChange={() => toggle(item.id)}
                  />
                  <span className="min-w-0">
                    <span className="block wrap-anywhere">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground capitalize">
                      {item.publicationStatus} · {item.visibility}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No matches.</p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {label.toLocaleLowerCase()} available.
        </p>
      )}
    </fieldset>
  );
}
