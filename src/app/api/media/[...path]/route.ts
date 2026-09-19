import { getCurrentAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMediaPubliclyReferenced } from "@/features/media/queries";
import { isValidMediaPath, MEDIA_BUCKET } from "@/features/media/config";

export const runtime = "nodejs";

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  if (!isValidMediaPath(path)) return notFound();

  const admin = await getCurrentAdmin();
  let isPublic = false;
  if (!admin) {
    try {
      isPublic = await isMediaPubliclyReferenced(path);
    } catch {
      return notFound();
    }
    if (!isPublic) return notFound();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .download(path);
  if (error || !data) return notFound();

  return new Response(data, {
    headers: {
      "Cache-Control": isPublic
        ? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
        : "private, no-store",
      "Content-Length": String(data.size),
      "Content-Type": data.type || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
