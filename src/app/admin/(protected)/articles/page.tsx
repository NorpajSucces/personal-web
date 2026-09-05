import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Articles" };

export default async function Page() {
  await requireAdmin();
  return (
    <AdminPlaceholder
      title="Articles"
      description="Long-form writing and ideas."
    />
  );
}
