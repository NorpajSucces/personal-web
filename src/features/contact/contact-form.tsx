"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import { sendContactMessage } from "./actions";
import {
  CONTACT_LIMITS,
  initialContactFormState,
  type ContactFormField,
  type ContactFormState,
} from "./schema";

const inputClassName =
  "block min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base leading-7 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ error, id }: { error?: string; id: string }) {
  return error ? (
    <p id={id} className="text-sm leading-6 text-destructive">
      {error}
    </p>
  ) : null;
}

export function ContactForm({
  initialSubmissionId,
}: {
  initialSubmissionId: string;
}) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const cooldownTimer = useRef<number | null>(null);
  const [submissionId, setSubmissionId] = useState(initialSubmissionId);
  const [coolingDown, setCoolingDown] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previousState: ContactFormState, formData: FormData) => {
      const result = await sendContactMessage(previousState, formData);
      if (result.status === "success") {
        formRef.current?.reset();
        setSubmissionId(crypto.randomUUID());
        setCoolingDown(true);
        if (cooldownTimer.current) window.clearTimeout(cooldownTimer.current);
        cooldownTimer.current = window.setTimeout(
          () => setCoolingDown(false),
          5_000,
        );
      }
      return result;
    },
    initialContactFormState,
  );

  useEffect(
    () => () => {
      if (cooldownTimer.current) window.clearTimeout(cooldownTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (state.errors) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);

  function errorProps(field: ContactFormField) {
    const errors = state.errors?.[field];
    return {
      "aria-invalid": Boolean(errors?.length),
      "aria-describedby": errors?.length
        ? `${formId}-${field}-error`
        : undefined,
    };
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="border-y"
    >
      <input type="hidden" name="submissionId" value={submissionId} />
      <div
        aria-hidden="true"
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <fieldset disabled={pending} className="min-w-0">
        <legend className="sr-only">Send a message</legend>
        <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-b py-5 sm:grid-cols-[2.5rem_7rem_minmax(0,1fr)] sm:gap-x-4">
          <span
            aria-hidden="true"
            className="pt-1 font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground"
          >
            01
          </span>
          <label
            htmlFor={`${formId}-name`}
            className="pt-1 text-sm font-medium"
          >
            Name
          </label>
          <div className="col-start-2 min-w-0 sm:col-start-3 sm:row-start-1">
            <input
              {...errorProps("name")}
              id={`${formId}-name`}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={CONTACT_LIMITS.name}
              required
              className={inputClassName}
            />
            <FieldError
              id={`${formId}-name-error`}
              error={state.errors?.name?.[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-b py-5 sm:grid-cols-[2.5rem_7rem_minmax(0,1fr)] sm:gap-x-4">
          <span
            aria-hidden="true"
            className="pt-1 font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground"
          >
            02
          </span>
          <label
            htmlFor={`${formId}-email`}
            className="pt-1 text-sm font-medium"
          >
            Email
          </label>
          <div className="col-start-2 min-w-0 sm:col-start-3 sm:row-start-1">
            <input
              {...errorProps("email")}
              id={`${formId}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={CONTACT_LIMITS.email}
              required
              className={inputClassName}
            />
            <FieldError
              id={`${formId}-email-error`}
              error={state.errors?.email?.[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-b py-5 sm:grid-cols-[2.5rem_7rem_minmax(0,1fr)] sm:gap-x-4">
          <span
            aria-hidden="true"
            className="pt-1 font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground"
          >
            03
          </span>
          <label
            htmlFor={`${formId}-message`}
            className="pt-1 text-sm font-medium"
          >
            Message
          </label>
          <div className="col-start-2 min-w-0 sm:col-start-3 sm:row-start-1">
            <textarea
              {...errorProps("message")}
              id={`${formId}-message`}
              name="message"
              rows={6}
              minLength={CONTACT_LIMITS.messageMin}
              maxLength={CONTACT_LIMITS.messageMax}
              required
              className={`${inputClassName} resize-y`}
            />
            <FieldError
              id={`${formId}-message-error`}
              error={state.errors?.message?.[0]}
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 py-5">
        <button
          type="submit"
          disabled={pending || coolingDown}
          className="min-h-11 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
        >
          {pending ? "Sending…" : coolingDown ? "Message sent" : "Send message"}
        </button>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`min-w-0 flex-1 text-sm leading-6 ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
        >
          {pending ? "Sending your message…" : state.message}
        </p>
      </div>
    </form>
  );
}
