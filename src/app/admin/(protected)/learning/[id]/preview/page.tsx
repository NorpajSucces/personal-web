import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LearningEntryCard } from "@/features/learning/learning-timeline";
import { getAdminLearningEntryById } from "@/features/learning/queries";
import { learningEntryIdSchema } from "@/features/learning/schema";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Learning Preview" };

export default async function LearningPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const idResult = learningEntryIdSchema.safeParse(id);
  if (!idResult.success) notFound();
  const entry = await getAdminLearningEntryById(idResult.data);
  if (!entry) notFound();
  return (
    <>
      <Link
        href="/admin/learning"
        className="mb-6 inline-flex min-h-10 items-center text-sm text-primary hover:underline"
      >
        ← Back to Learning admin
      </Link>
      <LearningEntryCard entry={entry} preview />
    </>
  );
}
