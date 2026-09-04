import type { Metadata } from "next";

import { PageIntro } from "@/components/shared/page-intro";

export const metadata: Metadata = {
  title: "Articles",
};

export default function ArticlesPage() {
  return (
    <PageIntro
      title="Articles"
      description="Developed, long-form writing will live here."
    />
  );
}
