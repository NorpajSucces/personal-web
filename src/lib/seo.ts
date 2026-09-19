import type { Metadata } from "next";

import { isSiteIndexable } from "./site-url.ts";

export const SITE_NAME = "Zhafran";
export const SITE_DESCRIPTION =
  "A personal digital home for what Zhafran builds, learns, and thinks about.";

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
};

function publicRobots(): Metadata["robots"] {
  if (!isSiteIndexable()) return noIndexRobots;

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function metadataDescription(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 159).trimEnd()}…`;
}

type PublicMetadataOptions = {
  title?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedAt?: Date | null;
  updatedAt?: Date | null;
};

export function createPublicMetadata({
  title,
  description,
  path,
  type = "website",
  publishedAt,
  updatedAt,
}: PublicMetadataOptions): Metadata {
  const normalizedDescription = metadataDescription(description);
  const socialTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const sharedOpenGraph = {
    title: socialTitle,
    description: normalizedDescription,
    siteName: SITE_NAME,
    locale: "en_US",
    url: path,
  };

  return {
    ...(title ? { title } : {}),
    description: normalizedDescription,
    alternates: { canonical: path },
    robots: publicRobots(),
    openGraph:
      type === "article"
        ? {
            ...sharedOpenGraph,
            type: "article",
            ...(publishedAt
              ? { publishedTime: publishedAt.toISOString() }
              : {}),
            ...(updatedAt ? { modifiedTime: updatedAt.toISOString() } : {}),
          }
        : { ...sharedOpenGraph, type: "website" },
    twitter: {
      card: "summary",
      title: socialTitle,
      description: normalizedDescription,
    },
  };
}

export function createNotFoundMetadata(): Metadata {
  return {
    title: "Not found",
    robots: noIndexRobots,
  };
}
