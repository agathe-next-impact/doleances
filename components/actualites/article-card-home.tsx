import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, MapIcon, User2 } from "lucide-react"

import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DateFormat, { TimeFormat } from "@/components/date-format"

interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  descriptif?: string
  date_de_levenement?: string
  heure_de_levenement?: string
  lieu_de_levenement?: string
  date: string
  author: string
  categories: string[]
  categoriesId: number[]
  categoriesSlug: string[]
  tags: string[]
  featuredImage?: string
}

interface ArticleCardProps {
  article: Article
}

export function ArticleCardHome({ article }: ArticleCardProps) {

  return (
    <Card className="flex flex-col overflow-hidden border-none shadow-none">
      {article.featuredImage && (
        <div className="relative h-48 w-full">
          <Image
            src={article.featuredImage || "/placeholder.svg?height=192&width=384&query=article"}
            alt={article.title}
            fill
            className="object-cover object-center rounded"
          />
        </div>
      )}
      <CardHeader className="pl-0">
        <CardTitle className="line-clamp-2">
          <Link href={`/article/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pl-0">
        <p className="line-clamp-3 text-muted-foreground">{article?.descriptif}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pl-0">
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category, index) => (
            <Badge key={`cat-${index}`} variant="secondary">              
              <Link href={`/category/${article.categoriesSlug[index]}`}>
              {category}
              </Link>
            </Badge>
          ))}
          {article.tags.slice(0, 2).map((tag, index, id) => (
            <Badge key={`tag-${index}`} variant="outline">
              <Link href={`/articles?tag=${id}`}>{tag}</Link>
            </Badge>
          ))}
        </div>
        {(article.categoriesSlug[0] != "evenements") && (
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
        )} 
        {(article.categoriesSlug[0] == "evenements") && (
        <div className="flex flex-col w-full justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapIcon className="h-3 w-3" />
            <span>{article?.lieu_de_levenement.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span><DateFormat dateStr={article?.date_de_levenement} /> à <TimeFormat timeStr={article?.heure_de_levenement} /></span>
          </div>
        </div>
        )}
      </CardFooter>
    </Card>
  )
}
