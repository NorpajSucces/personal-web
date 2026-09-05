"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { login } from "@/app/admin/login/actions";
import { initialLoginState } from "@/lib/auth/login-state";

function ResendLabel({ retryAt }: { retryAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((retryAt - now) / 1000));

  return (
    <button
      type="submit"
      name="intent"
      value="request"
      formNoValidate
      disabled={seconds > 0}
      className="min-h-11 rounded-md px-2 text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
    >
      {seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}
    </button>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialLoginState);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCode = state.stage === "code";

  useEffect(() => {
    inputRef.current?.focus();
  }, [state.stage]);

  return (
    <form action={action} className="mt-8 space-y-5" aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-5">
        <legend className="sr-only">
          {isCode ? "Verify your email" : "Request a sign-in code"}
        </legend>
        {isCode ? (
          <>
            <input type="hidden" name="email" value={state.email} />
            <p className="text-sm break-words text-muted-foreground">
              Enter the code sent to{" "}
              <span className="text-foreground">{state.email}</span>.
            </p>
            <div className="space-y-2">
              <label htmlFor="token" className="block text-sm font-medium">
                Verification code
              </label>
              <input
                key="token"
                ref={inputRef}
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6,10}"
                minLength={6}
                maxLength={10}
                required
                aria-describedby="login-status"
                aria-invalid={state.error || undefined}
                className="min-h-12 w-full rounded-md border border-input bg-background px-3 text-base tracking-[0.2em] disabled:opacity-60"
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              key="email"
              ref={inputRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={254}
              required
              aria-describedby="login-status"
              aria-invalid={state.error || undefined}
              className="min-h-12 w-full rounded-md border border-input bg-background px-3 text-base disabled:opacity-60"
            />
          </div>
        )}
        <button
          type="submit"
          name="intent"
          value={isCode ? "verify" : "request"}
          className="min-h-12 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? "Please wait…"
            : isCode
              ? "Verify and sign in"
              : "Send sign-in code"}
        </button>
        {isCode && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ResendLabel retryAt={state.retryAt} />
            <button
              type="submit"
              name="intent"
              value="change-email"
              formNoValidate
              className="min-h-11 rounded-md px-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Use another email
            </button>
          </div>
        )}
      </fieldset>
      <p
        id="login-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-sm leading-relaxed text-muted-foreground"
      >
        {pending ? "Processing your request…" : state.message}
      </p>
    </form>
  );
}
