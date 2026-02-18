export default function Loading() {
  return (
    <div className="container mx-auto md:p-8 p-4">
      <div className="animate-pulse">
        {/* Category hero */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="h-4 w-96 max-w-full rounded bg-muted" />
        </div>

        {/* Search filter bar */}
        <div className="mb-8 h-12 rounded-lg bg-muted" />

        {/* Article cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg bg-muted overflow-hidden">
              <div className="h-48 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 rounded bg-background/50" />
                <div className="h-4 w-full rounded bg-background/50" />
                <div className="h-4 w-2/3 rounded bg-background/50" />
                <div className="h-3 w-1/4 rounded bg-background/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
