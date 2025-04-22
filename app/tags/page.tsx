import type { Metadata } from "next"
import Link from "next/link"
import { fetchTags } from "@/lib/wordpress"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Tags - WikiPress",
  description: "Browse all article tags in our knowledge base",
}

export default async function TagsPage() {
  const tags = await fetchTags()

  // Sort tags by count (most articles first)
  const sortedTags = [...tags].sort((a, b) => b.count - a.count)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Tags</h1>
        <p className="text-lg text-muted-foreground">Browse our articles by tag to find related content.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {sortedTags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-base py-2 px-4">
            <Link href={`/tags/${tag.slug}`} className="hover:underline">
              {tag.name} ({tag.count})
            </Link>
          </Badge>
        ))}
      </div>
    </div>
  )
}
