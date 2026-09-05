import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { getCurrentAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-md py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Back to website
          </Link>
          <ThemeToggle />
        </div>
        <section
          aria-labelledby="login-title"
          className="rounded-xl border bg-card p-6 sm:p-8"
        >
          <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
            Zhafran / Admin
          </p>
          <h1 id="login-title" className="font-serif text-4xl tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sign in with an email code to access your publishing space.
          </p>
          <LoginForm />
        </section>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Private access for the site owner.
        </p>
      </div>
    </main>
  );
}
