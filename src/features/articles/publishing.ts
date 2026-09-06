export function resolvePublishedAt(
  existing: Date | null,
  nextStatus: "draft" | "published",
  now = () => new Date(),
) {
  return nextStatus === "published" && !existing ? now() : existing;
}
