export default function Loading() {
  return (
    <div className="container mx-auto md:p-8 p-4">
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-1/4 rounded bg-muted"></div>
        <div className="h-4 w-1/2 rounded bg-muted"></div>
        <div className="h-12 rounded bg-muted"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-lg bg-muted"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
