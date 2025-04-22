import { ArticleCard } from "@/components/article-card"

interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
  categories: string[]
  tags: string[]
  featuredImage?: string
}

interface ArticleGridProps {
  articles: Article[]
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div>
          <p className="text-lg font-medium">No articles found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
