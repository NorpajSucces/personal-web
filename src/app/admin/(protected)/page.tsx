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
        Home, Project, Article, and Note content management are ready. Learning
        will arrive in an upcoming phase.
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
          Project, Article, and Note creation are available. Learning arrives in
          a later phase.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/projects/new"
            className="inline-flex min-h-11 items-center rounded-md border border-primary/50 px-4 text-sm font-medium text-primary hover:bg-accent"
          >
            New Project
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex min-h-11 items-center rounded-md border border-primary/50 px-4 text-sm font-medium text-primary hover:bg-accent"
          >
            New Article
          </Link>
          <Link
            href="/admin/notes/new"
            className="inline-flex min-h-11 items-center rounded-md border border-primary/50 px-4 text-sm font-medium text-primary hover:bg-accent"
          >
            New Note
          </Link>
          <button
            disabled
            className="min-h-11 cursor-not-allowed rounded-md border px-4 text-sm text-muted-foreground"
          >
            New Learning Entry
          </button>
        </div>
      </section>
    </>
  );
}
