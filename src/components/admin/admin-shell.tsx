import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/public/theme-toggle";

import { AdminNavigation } from "./admin-navigation";
import { LogoutButton } from "./logout-button";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#admin-content"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <aside className="border-b bg-card p-5 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-6">
        <Link
          href="/admin"
          className="mb-6 inline-block rounded-md font-serif text-2xl"
        >
          Zhafran{" "}
          <span className="font-sans text-xs text-muted-foreground">
            / Admin
          </span>
        </Link>
        <AdminNavigation />
        <div className="mt-4 border-t pt-4 lg:mt-auto">
          <LogoutButton />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b px-5 sm:px-8">
          <p className="text-sm text-muted-foreground">Your publishing space</p>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-md py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              View website
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main
          id="admin-content"
          tabIndex={-1}
          className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
