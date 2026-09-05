"use server";

import { redirect } from "next/navigation";

import { getAdminUserId } from "@/lib/auth/admin";
import { initialLoginState, type LoginState } from "@/lib/auth/login-state";
import { requestSignInCode, verifyAdminCode } from "@/lib/auth/otp";
import { emailSchema, otpSchema } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export async function login(
  previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const intent = formData.get("intent");
  if (intent === "change-email") return initialLoginState;

  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  if (!parsedEmail.success) {
    return {
      ...initialLoginState,
      message: "Enter a valid email address.",
      error: true,
    };
  }

  const email = parsedEmail.data;
  const state: LoginState = {
    stage: "code",
    email,
    message: "",
    error: false,
    retryAt: previous.retryAt,
  };
  const adminUserId = getAdminUserId();
  const supabase = await createClient();

  if (intent === "request") {
    await requestSignInCode(supabase.auth, email);
    return {
      ...state,
      retryAt: Date.now() + 60_000,
      message:
        "If this email is authorized, a verification code has been sent. Delivery may take a moment. Wait a minute before requesting another code; if requests are limited, try again later.",
    };
  }

  const token = otpSchema.safeParse(formData.get("token"));
  const failure: LoginState = {
    ...state,
    error: true,
    message: "Unable to sign in. Check your code or request a new one.",
  };
  if (intent !== "verify" || !token.success) return failure;

  const authorized = await verifyAdminCode(
    supabase.auth,
    email,
    token.data,
    adminUserId,
  );
  if (!authorized) return failure;

  redirect("/admin");
}
