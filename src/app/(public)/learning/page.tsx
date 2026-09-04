import type { Metadata } from "next";

import { PageIntro } from "@/components/shared/page-intro";

export const metadata: Metadata = {
  title: "Learning",
};

export default function LearningPage() {
  return (
    <PageIntro
      title="Learning"
      description="A chronological learning journey will live here."
    />
  );
}
