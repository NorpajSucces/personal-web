import { Container } from "@/components/shared/container";

function LoadingLine({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-sm bg-muted ${className}`}
    />
  );
}

export default function PublicLoading() {
  return (
    <div role="status" aria-label="Loading page">
      <section className="border-b border-border/70">
        <Container>
          <div className="max-w-3xl py-[clamp(5rem,12vw,8rem)]">
            <LoadingLine className="h-3 w-24" />
            <LoadingLine className="mt-6 h-16 w-4/5 sm:h-24" />
            <LoadingLine className="mt-6 h-5 w-full max-w-2xl" />
            <LoadingLine className="mt-3 h-5 w-2/3 max-w-xl" />
          </div>
        </Container>
      </section>
      <Container className="py-[var(--section-space)]">
        <LoadingLine className="h-8 w-48" />
        <LoadingLine className="mt-6 h-5 w-full max-w-2xl" />
        <LoadingLine className="mt-3 h-5 w-5/6 max-w-xl" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <LoadingLine className="h-52 w-full" />
          <LoadingLine className="h-52 w-full" />
        </div>
      </Container>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
