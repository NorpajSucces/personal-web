import Link from "next/link";

import { Container } from "@/components/shared/container";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center py-16">
      <Container className="text-center">
        <p className="font-mono text-xs tracking-[0.16em] text-primary uppercase">
          404 / Not found
        </p>
        <h1 className="mt-4 font-serif text-[clamp(3rem,9vw,6rem)] leading-none tracking-[-0.04em]">
          This page is not here.
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">
          The address may be outdated, or this content may not be publicly
          available.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium text-primary hover:bg-accent"
        >
          Return home
        </Link>
      </Container>
    </main>
  );
}
