import type { Metadata } from "next";

import { ExperienceManager } from "@/features/home/experience-manager";
import { getExperiences } from "@/features/home/experience-queries";
import { HomeForm } from "@/features/home/home-form";
import { getHomeContent } from "@/features/home/queries";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Home" };

export default async function Page() {
  await requireAdmin();
  const [content, experiences] = await Promise.all([
    getHomeContent(),
    getExperiences(),
  ]);
  return (
    <>
      <h1 className="mb-3 font-serif text-4xl">Home content</h1>
      <p className="mb-8 text-muted-foreground">
        Edit your introduction, About, and direct contact details.
      </p>
      <HomeForm initialValues={content} />
      <ExperienceManager experiences={experiences} />
    </>
  );
}
