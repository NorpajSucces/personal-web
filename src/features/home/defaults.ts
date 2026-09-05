import type { homeContent } from "../../db/schema/home.ts";
import type { HomeContentValues } from "./schema.ts";

export const defaultHomeContent: Readonly<HomeContentValues> = {
  heroTitle: "Hi, I’m Zhafran.",
  heroDescription:
    "This is where I document what I build, what I learn, and how my thinking evolves.",
  aboutTitle: "About",
  aboutContent:
    "This site brings projects, long-form writing, shorter notes, and a chronological learning journey into one evolving place.",
  contactTitle: "Contact",
  contactDescription: "A direct way to start a conversation.",
  publicEmail: "",
  githubUrl: "",
  linkedinUrl: "",
};

export function toHomeContentValues(
  row?: typeof homeContent.$inferSelect,
): HomeContentValues {
  if (!row) return { ...defaultHomeContent };

  return {
    heroTitle: row.heroTitle,
    heroDescription: row.heroDescription,
    aboutTitle: row.aboutTitle,
    aboutContent: row.aboutContent,
    contactTitle: row.contactTitle,
    contactDescription: row.contactDescription,
    publicEmail: row.publicEmail ?? "",
    githubUrl: row.githubUrl ?? "",
    linkedinUrl: row.linkedinUrl ?? "",
  };
}
