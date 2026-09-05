import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import { isAdminIdentity } from "./policy";

export function getAdminUserId() {
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId) {
    throw new Error(
      "ADMIN_USER_ID is required for administrator authorization.",
    );
  }
  return adminUserId;
}

// React cache deduplicates within one render, not across requests or users.
export const getCurrentAdmin = cache(async () => {
  const adminUserId = getAdminUserId();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !isAdminIdentity(data.user?.id, adminUserId)) return null;
  return data.user;
});

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
