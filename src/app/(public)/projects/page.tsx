import type { Metadata } from "next";

import { PageIntro } from "@/components/shared/page-intro";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <PageIntro
      title="Projects"
      description="Selected work and engineering case studies will live here."
    />
  );
}
