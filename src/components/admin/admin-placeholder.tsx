export function AdminPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
      <p className="mt-3 max-w-prose text-muted-foreground">{description}</p>
      <section
        aria-label="Management availability"
        className="mt-8 rounded-xl border bg-card p-6"
      >
        <h2 className="text-base font-medium">
          This workspace is taking shape.
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Content management is not available yet. This section will be ready in
          a future update.
        </p>
      </section>
    </>
  );
}
