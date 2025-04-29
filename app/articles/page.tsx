import { Suspense } from "react"
import type { Metadata } from "next"
import { fetchArticles, fetchCategories, fetchTags } from "@/lib/wordpress"
import { ArticleGrid } from "@/components/article-grid"
import { ArticleFilters } from "@/components/article-filters"
import { Pagination } from "@/components/pagination"
import { SearchAutocomplete } from "@/components/search-autocomplete"

export const metadata: Metadata = {
  title: "Articles Archive - WikiPress",
  description: "Browse all articles in our knowledge base",
}

interface ArticlesPageProps {
  searchParams: {
    page?: string
    category?: string | string[]
    tag?: string | string[]
    search?: string
  }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  // Get the current page from the search params or default to 1
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const perPage = 9 // Number of articles per page

  // Get categories and tags for filters
  const categories = await fetchCategories()
  const tags = await fetchTags() 

  // Get articles with filters
  const { articles, total, totalPages } = await fetchArticles({
    page: currentPage,
    perPage,
    categoryId: searchParams.category,
    tagId: searchParams.tag,
    search: searchParams.search,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Archives des doléances</h1>
        <p className="text-lg text-muted-foreground">
          Retrouvez toutes les doléances déposées par les citoyens et citoyennes.
        </p>
        <div className="mx-auto max-w-md py-8">
          <SearchAutocomplete placeholder="Rechercher des articles" buttonLabel="Rechercher" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[250px_1fr]">
        <aside className="space-y-6">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ArticleFilters categories={categories} tags={tags} selectedFilters={searchParams} />
          </Suspense>
        </aside>

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
              baseUrl="/articles"
              searchParams={searchParams}
            />
          )}
        </div>
      </div>
    </div>
  )
}
