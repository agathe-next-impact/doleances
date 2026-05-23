export default function Loading() {
  return (
    <div className="container mx-auto md:p-8 p-4">
      <div className="animate-pulse">
        {/* Share buttons */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-muted" />
          ))}
        </div>

        {/* Article header */}
        <div className="max-w-3xl mx-auto space-y-4 mb-8">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="flex gap-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>

        {/* Featured image */}
        <div className="max-w-3xl mx-auto h-80 rounded-lg bg-muted mb-8" />

        {/* Content lines */}
        <div className="max-w-3xl mx-auto space-y-3">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-muted"
              style={{ width: `${65 + Math.random() * 35}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
