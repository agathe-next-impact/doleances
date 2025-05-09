import { fetchCategories } from "@/lib/api"
import CategoryCard from "@/components/category-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, User2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { fetchFeaturedArticles } from "@/lib/wordpress"
import Verbatim from "@/components/verbatim"


export default async function Home() {
  const categories = await fetchCategories()
  const articles = await fetchFeaturedArticles()
  const stickyArticle = articles[0]

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">L'actualité des Doléances</h1>
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 grid grid-cols-2 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        <div className="col-span-1 flex flex-col gap-6">
        <div className="flex flex-col col-span-2 row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
          {stickyArticle && stickyArticle.featuredImage && (
            <div className="relative h-48 w-full">
              <Image
                src={stickyArticle.featuredImage || "/placeholder.svg"}
                alt={stickyArticle.title}
                fill
                className="object-cover object-center"
              />
            </div>
          )}
          <div className="flex flex-col flex-grow p-6">
            <h2 className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">à la une</h2>
            {stickyArticle && (
              <>
                <h3 className="mb-2 font-medium">
                  <Link href={`/article/${stickyArticle.id}`}>
                    {stickyArticle.title}
                  </Link></h3>
                <div
                  className="mb-4 flex-grow line-clamp-3 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: stickyArticle.excerpt }}
                />
                    <div className="flex flex-wrap gap-2 pt-2">
                    {stickyArticle.categories.map((category, index) => (
                      <Badge key={`cat-${index}`} variant="secondary">            
                        <Link href={`/article/${stickyArticle.categoriesSlug[index]}`}>
                        {category}
                        </Link>
                      </Badge>
                    ))}
                    {stickyArticle.tags.slice(0, 2).map((tag, index, id) => (
                      <Badge key={`tag-${index}`} variant="outline">
                        <Link href={`article/?tag=${id}`}>{tag}</Link>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex w-full items-center justify-between p-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User2 className="h-3 w-3" />
                      <span>{stickyArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1 pb-2">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(stickyArticle.date)}</span>
                    </div>
                  </div>
                <Button variant="outline" asChild>
                  <Link href={`/article/${stickyArticle.id}`}>Lire plus</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div>
          <Verbatim />
        </div>
        </div>
        </div>
      )}
    </main>
  )
}