export default function Loading() {
  return (
    <div className="container mx-auto md:p-8 p-4">
      <div className="animate-pulse">
        {/* Titre + sous-titre */}
        <div className="mt-8 mb-12 flex flex-col items-center gap-3">
          <div className="h-10 w-64 rounded bg-muted" />
          <div className="h-4 w-80 rounded bg-muted" />
        </div>

        {/* Sticky post + verbatim */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 col-span-3 h-64 rounded-lg bg-muted" />
          <div className="col-span-1 hidden lg:flex flex-col gap-3 my-8">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>

          {/* Category cards */}
          <div className="col-span-3 grid grid-cols-6 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="lg:col-span-3 col-span-6 h-72 rounded-lg bg-muted" />
            ))}
          </div>
        </div>

        {/* Hero section */}
        <div className="grid gap-12 grid-cols-6 mb-12">
          <div className="lg:col-span-4 col-span-6 h-96 rounded-lg bg-muted" />
          <div className="lg:col-span-2 col-span-6 h-72 rounded-lg bg-muted" />
        </div>

        {/* Introduction cards */}
        <div className="grid gap-12 lg:grid-cols-4 mb-8">
          <div className="lg:col-span-2 h-64 rounded-lg bg-muted" />
          <div className="lg:col-span-2 h-80 rounded-lg bg-muted" />
          <div className="lg:col-span-2 h-48 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}
