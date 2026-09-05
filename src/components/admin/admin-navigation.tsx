"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { adminSections } from "./navigation-items";

export function AdminNavigation() {
  const pathname = usePathname();
  const primary = [
    { href: "/admin", label: "Dashboard" },
    ...adminSections.slice(0, -1),
  ];
  const secondary = adminSections.slice(-1);

  function renderLinks(items: ReadonlyArray<{ href: string; label: string }>) {
    return items.map(({ href, label }) => {
      const active =
        pathname === href ||
        (href !== "/admin" && pathname.startsWith(`${href}/`));
      return (
        <li key={href}>
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center rounded-md px-3 text-sm transition-colors",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        </li>
      );
    });
  }

  return (
    <nav aria-label="Admin navigation" className="space-y-4">
      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
        {renderLinks(primary)}
      </ul>
      <ul className="border-t pt-4">{renderLinks(secondary)}</ul>
    </nav>
  );
}
