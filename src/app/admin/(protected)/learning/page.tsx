import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Learning" };

export default async function Page() {
  await requireAdmin();
  return (
    <AdminPlaceholder
      title="Learning"
      description="Learning entries and related work."
    />
  );
}
