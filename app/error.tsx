"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto md:p-8 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
      <p className="text-muted-foreground mb-6">
        Impossible de charger cette page. Veuillez réessayer.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Réessayer
      </button>
    </div>
  )
}
