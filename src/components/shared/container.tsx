import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const containerWidths = {
  page: "max-w-[var(--container-page)]",
  home: "max-w-[var(--container-home)]",
  reading: "max-w-[var(--container-reading)]",
} as const;

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: keyof typeof containerWidths;
};

export function Container({
  className,
  size = "page",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-[var(--page-gutter)]",
        containerWidths[size],
        className,
      )}
      {...props}
    />
  );
}
