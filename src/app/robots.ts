import type { MetadataRoute } from "next";

import { absoluteSiteUrl, isSiteIndexable } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  if (!isSiteIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
