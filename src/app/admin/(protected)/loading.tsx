export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading admin page" className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-md bg-muted" />
      <div className="h-5 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-44 animate-pulse rounded-lg border bg-card" />
        <div className="h-44 animate-pulse rounded-lg border bg-card" />
      </div>
      <span className="sr-only">Loading admin page…</span>
    </div>
  );
}
