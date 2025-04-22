import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarIcon, Clock, User2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { TableOfContents } from "@/components/table-of-contents"
import { fetchArticleBySlug, fetchRelatedArticles } from "@/lib/wordpress"
import { formatDate } from "@/lib/utils"
import { GutenbergContent } from "@/components/gutenberg-content"

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await fetchArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await fetchRelatedArticles(article.id, article.categories)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category) => (
            <Badge key={category} variant="secondary">
              <Link href={`/categories/${category.toLowerCase()}`}>{category}</Link>
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User2 className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(article.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </div>

      {article.featuredImage && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96">
          <Image
            src={article.featuredImage || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_250px]">
        <div>
          <article className="gutenberg-wrapper">
            <GutenbergContent content={article.content} />
          </article>
        </div>
        <aside className="order-first md:order-last">
          <div className="sticky top-8 space-y-6">
            <TableOfContents headings={article.headings} />
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold">Related Articles</h3>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="space-y-1">
                    <Link
                      href={`/articles/${relatedArticle.slug}`}
                      className="line-clamp-2 font-medium hover:underline"
                    >
                      {relatedArticle.title}
                    </Link>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {relatedArticle.excerpt.replace(/<[^>]*>/g, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
