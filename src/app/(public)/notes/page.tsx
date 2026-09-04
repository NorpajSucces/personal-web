import type { Metadata } from "next";

import { PageIntro } from "@/components/shared/page-intro";

export const metadata: Metadata = {
  title: "Notes",
};

export default function NotesPage() {
  return (
    <PageIntro
      title="Notes"
      description="Shorter observations, references, and evolving thoughts will live here."
    />
  );
}
