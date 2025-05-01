import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, User2 } from "lucide-react"

import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface ArticleCardProps {
  article: Article
}

export function ArticleCardHome({ article }: ArticleCardProps) {
  // Clean excerpt text for better display
  const cleanExcerpt = article.excerpt
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim()

  return (
    <Card className="flex flex-col overflow-hidden border-none shadow-none">
      {article.featuredImage && (
        <div className="relative h-48 w-full">
          <Image
            src={article.featuredImage || "/placeholder.svg?height=192&width=384&query=article"}
            alt={article.title}
            fill
            className="object-contain object-left"
          />
        </div>
      )}
      <CardHeader className="pl-0">
        <CardTitle className="line-clamp-2">
          <Link href={`/articles/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pl-0">
        <p className="line-clamp-3 text-muted-foreground">{cleanExcerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pl-0">
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category, index) => (
            <Badge key={`cat-${index}`} variant="secondary">
              <Link href={`/articles?category=${category.toLowerCase()}`}>{category}</Link>
            </Badge>
          ))}
          {article.tags.slice(0, 2).map((tag, index) => (
            <Badge key={`tag-${index}`} variant="outline">
              <Link href={`/articles?tag=${tag.toLowerCase()}`}>{tag}</Link>
            </Badge>
          ))}
        </div>
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User2 className="h-3 w-3" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{formatDate(article.date)}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
