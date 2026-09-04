import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type SectionProps = ComponentPropsWithoutRef<"section">;

export function Section({ className, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "scroll-mt-24 border-t border-border/70 py-[var(--section-space)]",
        className,
      )}
      {...props}
    />
  );
}
