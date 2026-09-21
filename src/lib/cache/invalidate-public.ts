import * as nextCache from "next/cache";

export function invalidatePublicCache(tag: string) {
  // Server Actions should use updateTag so the next render observes the
  // mutation immediately. The fallback keeps this helper compatible with
  // older runtimes and isolated test doubles.
  if (typeof nextCache.updateTag === "function") {
    nextCache.updateTag(tag);
    return;
  }

  if (typeof nextCache.revalidateTag === "function") {
    nextCache.revalidateTag(tag, "max");
  }
}
