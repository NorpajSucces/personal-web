import { getSafeHttpUrl } from "./url.ts";

const LOCAL_SITE_URL = new URL("http://localhost:3000");

export function getConfiguredSiteUrl(): URL | null {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return null;

  const safeUrl = getSafeHttpUrl(value);
  if (!safeUrl) return null;

  const url = new URL(safeUrl);
  if (url.pathname !== "/" || url.search || url.hash) return null;
  return url;
}

export function getSiteUrl() {
  return getConfiguredSiteUrl() ?? LOCAL_SITE_URL;
}

export function isSiteIndexable() {
  return getConfiguredSiteUrl()?.protocol === "https:";
}

export function absoluteSiteUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}
