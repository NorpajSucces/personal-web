"use client";

import { useActionState } from "react";

import { logout } from "@/app/admin/logout-actions";

export function LogoutButton() {
  const [state, action, pending] = useActionState(logout, { error: "" });

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-md px-3 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
      >
        {pending ? "Signing out…" : "Logout"}
      </button>
      <p role="status" className="px-3 text-xs text-muted-foreground">
        {state.error}
      </p>
    </form>
  );
}
