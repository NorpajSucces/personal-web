import type { ReactNode } from "react";

import { BottomNavigation } from "@/components/public/bottom-navigation";

type PublicLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <BottomNavigation />
      <main
        id="main-content"
        className="min-h-dvh pb-[calc(6rem+env(safe-area-inset-bottom))]"
        tabIndex={-1}
      >
        {children}
      </main>
    </>
  );
}
