import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { fetchArticles, fetchCategories } from "@/lib/wordpress"
import { ArticleGrid } from "@/components/article-grid"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await fetchCategories()
  const category = categories.find((cat) => cat.slug === params.slug)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} - WikiPress`,
    description: category.description || `Articles in the ${category.name} category`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categories = await fetchCategories()
  const category = categories.find((cat) => cat.slug === params.slug)

  if (!category) {
    notFound()
  }

  // Get the current page from the search params or default to 1
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const perPage = 9 // Number of articles per page

  // Get articles in this category
  const { articles, total, totalPages } = await fetchArticles({
    page: currentPage,
    perPage,
    categoryId: params.slug,
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
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{category.name}</h1>
        {category.description && <p className="text-lg text-muted-foreground">{category.description}</p>}
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
            baseUrl={`/categories/${params.slug}`}
            searchParams={searchParams}
          />
        )}
      </div>
    </div>
  )
}
