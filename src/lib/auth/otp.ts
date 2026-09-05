import type { SupabaseClient } from "@supabase/supabase-js";

import { isAdminIdentity } from "./policy.ts";

type AuthClient = Pick<
  SupabaseClient["auth"],
  "signInWithOtp" | "verifyOtp" | "getUser" | "signOut"
>;

// These operations receive a request-scoped server client from the login action.
// They never return SDK responses, identities, tokens, or internal errors to UI.
export async function requestSignInCode(auth: AuthClient, email: string) {
  try {
    await auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
  } catch {
    // Keep transport and account-dependent failures indistinguishable.
  }
}

export async function verifyAdminCode(
  auth: AuthClient,
  email: string,
  token: string,
  adminUserId: string,
): Promise<boolean> {
  try {
    const { error } = await auth.verifyOtp({ email, token, type: "email" });
    if (error) return false;

    // A fresh Auth server lookup is the authorization boundary, not session data.
    const { data, error: identityError } = await auth.getUser();
    if (identityError || !isAdminIdentity(data.user?.id, adminUserId)) {
      await auth.signOut({ scope: "local" });
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
