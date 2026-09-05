import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Home" };

export default async function Page() {
  await requireAdmin();
  return (
    <AdminPlaceholder
      title="Home"
      description="Introduction, About, and Contact."
    />
  );
}
