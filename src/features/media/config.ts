export const MEDIA_BUCKET = "media";
export const MAX_MEDIA_SIZE = 5 * 1024 * 1024;

export const allowedMediaTypes = [
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const extensionByType: Record<(typeof allowedMediaTypes)[number], string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getMediaExtension(contentType: string) {
  return extensionByType[contentType as keyof typeof extensionByType] ?? null;
}

export function isValidMediaPath(path: string) {
  return (
    path.length > 0 &&
    path.length <= 300 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    path
      .split("/")
      .every(
        (segment) => segment.length > 0 && segment !== "." && segment !== "..",
      )
  );
}

export function getMediaUrl(path: string) {
  if (!isValidMediaPath(path)) return "";
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/media/${encodedPath}`;
}
