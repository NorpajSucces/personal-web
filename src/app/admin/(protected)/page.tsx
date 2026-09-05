import type { Metadata } from "next";
import Link from "next/link";

import { adminSections } from "@/components/admin/navigation-items";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();
  return (
    <>
      <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
        Personal digital home
      </p>
      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
        A place to keep creating.
      </h1>
      <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
        Your publishing space is ready. Content editing will arrive in the
        upcoming updates.
      </p>
      <section aria-labelledby="workspaces-title" className="mt-10">
        <h2 id="workspaces-title" className="mb-4 text-sm font-semibold">
          Your workspaces
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {adminSections.map(({ href, label, description }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/60"
            >
              <h3 className="font-serif text-2xl">
                {label}{" "}
                <span aria-hidden="true" className="text-primary">
                  ↗
                </span>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="quick-actions-title" className="mt-10">
        <h2 id="quick-actions-title" className="text-sm font-semibold">
          Quick actions
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Creating content is not available yet.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {["New Article", "New Note", "New Project", "New Learning Entry"].map(
            (label) => (
              <button
                key={label}
                disabled
                className="min-h-11 cursor-not-allowed rounded-md border px-4 text-sm text-muted-foreground"
              >
                {label}
              </button>
            ),
          )}
        </div>
      </section>
    </>
  );
}
