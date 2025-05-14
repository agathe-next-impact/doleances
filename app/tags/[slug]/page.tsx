import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { fetchArticles, fetchTags } from "@/lib/wordpress"
import { ArticleGrid } from "@/components/actualites/article-grid"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"

interface TagPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tags = await fetchTags()
  const tag = tags.find((t) => t.slug === params.slug)

  if (!tag) {
    return {
      title: "Tag Not Found",
    }
  }

  return {
    title: `${tag.name} - WikiPress`,
    description: `Articles tagged with ${tag.name}`,
  }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const tags = await fetchTags()
  const tag = tags.find((t) => t.slug === params.slug)

  if (!tag) {
    notFound()
  }

  // Get the current page from the search params or default to 1
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const perPage = 9 // Number of articles per page

  // Get articles with this tag
  const { articles, total, totalPages } = await fetchArticles({
    page: currentPage,
    perPage,
    tagId: params.slug,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Tag: {tag.name}</h1>
        <p className="text-lg text-muted-foreground">Browse all articles tagged with {tag.name}</p>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{articles.length}</span> of{" "}
            <span className="font-medium">{total}</span> articles
          </p>
        </div>

        <ArticleGrid articles={articles} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/tags/${params.slug}`}
            searchParams={searchParams}
          />
        )}
      </div>
    </div>
  )
}
