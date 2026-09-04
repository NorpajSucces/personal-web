import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type SurfaceCardProps = ComponentPropsWithoutRef<"div">;

export function SurfaceCard({ className, ...props }: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-card p-6 text-card-foreground sm:p-7",
        className,
      )}
      {...props}
    />
  );
}
