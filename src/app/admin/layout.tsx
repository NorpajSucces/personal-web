import type { Metadata } from "next";
import type { ReactNode } from "react";

import { noIndexRobots } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: noIndexRobots,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
