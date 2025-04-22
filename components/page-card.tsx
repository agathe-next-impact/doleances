import Link from "next/link"
import Image from "next/image"
import { CalendarIcon } from "lucide-react"

import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PageCardProps {
  page: {
    id: number
    slug: string
    title: string
    excerpt: string
    featuredImage?: string
    date: string
    modified: string
  }
}

export function PageCard({ page }: PageCardProps) {
  // Clean excerpt text for better display
  const cleanExcerpt = page.excerpt
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim()

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg">
      {page.featuredImage && (
        <div className="relative h-48 w-full">
          <Image src={page.featuredImage || "/placeholder.svg"} alt={page.title} fill className="object-cover" />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">
          <Link href={`/pages/${page.slug}`} className="hover:underline font-serif uppercase text-2xl font-bold">
            {page.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3 text-muted-foreground">{cleanExcerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        {/*<div className="flex w-full items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Updated: {formatDate(page.modified)}</span>
          </div>
        </div>*/}
        <Button variant="outline" asChild className="w-full">
          <Link href={`/pages/${page.slug}`}>Voir</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
