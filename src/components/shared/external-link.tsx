import type { ReactNode } from "react";

import { getSafeHttpUrl } from "@/lib/url";

export function ExternalLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: unknown;
}) {
  const safeHref = getSafeHttpUrl(href);
  if (!safeHref) return null;

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
