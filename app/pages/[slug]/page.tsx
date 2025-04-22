import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarIcon } from "lucide-react"

import { fetchPageBySlug } from "@/lib/wordpress"
import { formatDate } from "@/lib/utils"
import { GutenbergContent } from "@/components/gutenberg-content"

interface PageProps {
  params: {
    slug: string
  }
}

export default async function Page({ params }: PageProps) {
  const page = await fetchPageBySlug(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{page.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Last updated: {formatDate(page.modified)}</span>
          </div>
        </div>
      </div>

      {page.featuredImage && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96">
          <Image
            src={page.featuredImage || "/placeholder.svg"}
            alt={page.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="gutenberg-wrapper">
        <GutenbergContent content={page.content} />
      </div>
    </div>
  )
}
