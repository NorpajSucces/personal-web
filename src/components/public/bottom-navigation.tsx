"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/public/theme-toggle";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  { href: "/notes", label: "Notes" },
  { href: "/learning", label: "Learning" },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();
  const activeIndex = navigationItems.findIndex(({ href }) =>
    isActiveRoute(pathname, href),
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const indicatorIndex = hoveredIndex ?? activeIndex;
  const indicatorIsVisible = indicatorIndex >= 0;

  return (
    <div
      data-bottom-navigation
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center rounded-xl border border-border/80 bg-card p-0.5 text-card-foreground shadow-md min-[360px]:p-1"
    >
      <nav
        aria-label="Primary navigation"
        onPointerCancel={() => setHoveredIndex(null)}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <ul className="relative grid h-11 w-[clamp(15.5rem,72vw,22rem)] grid-cols-5">
          <li
            aria-hidden="true"
            data-navigation-indicator
            className={cn(
              "pointer-events-none absolute inset-y-1 left-0 w-1/5 rounded-lg border border-primary/25 bg-accent transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
              indicatorIsVisible ? "opacity-100" : "opacity-0",
            )}
            style={{
              transform: `translateX(${Math.max(indicatorIndex, 0) * 100}%)`,
            }}
          />

          {navigationItems.map((item, index) => {
            const isActive = index === activeIndex;
            const isHighlighted = index === indicatorIndex;

            return (
              <li className="min-w-0" key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative z-10 flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-lg px-0.5 text-[clamp(0.75rem,3.2vw,0.875rem)] font-medium transition-colors duration-150 motion-reduce:transition-none",
                    isHighlighted
                      ? "text-accent-foreground"
                      : isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    isActive && "font-semibold",
                  )}
                  onClick={() => setHoveredIndex(null)}
                  onPointerEnter={() => setHoveredIndex(index)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <span
        aria-hidden="true"
        className="mx-0.5 h-6 w-px shrink-0 bg-border min-[360px]:mx-1"
      />
      <ThemeToggle />
    </div>
  );
}
