export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey?.startsWith("sb_publishable_")) {
    throw new Error("Supabase public URL and publishable key are required.");
  }

  return { url, publishableKey };
}
