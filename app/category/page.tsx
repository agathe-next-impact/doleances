import { fetchCategories, fetchLastThreePosts } from "@/lib/api"
import CategoryCard from "@/components/actualites/category-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, User2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import Verbatim from "@/components/verbatim"


export default async function Home() {
  const categories = await fetchCategories()
  // order by count
  categories.sort((a, b) => b.count - a.count)
  const articles = await fetchLastThreePosts()
  const stickyArticle = articles[0]

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="py-8 text-center">
          <h1 className="">L'actualité des doléances</h1> 
          <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
          Wiki du corpus des doléances de 2018/2019</p>
          </div>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
              </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 flex row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
              {stickyArticle && (
                <div className="relative h-full w-1/3">
                  <Image
                    src={stickyArticle.featuredImage || "/img/doleance_couv.png"}
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
                      <Link href={`/article/${stickyArticle.slug}`}>
                        {stickyArticle.title}
                      </Link></h3>
                    <div
                      className="mb-4 flex-grow line-clamp-3 text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: stickyArticle.descriptif }}
                    />
                        <div className="flex flex-wrap gap-2 pt-2">
                        {stickyArticle.categories.map((category, index) => (
                          <Badge key={`cat-${index}`} variant="secondary">            
                            <Link href={`/category/${stickyArticle.categoriesSlug[index]}`}>
                            {category}
                            </Link>
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
                      <Link href={`/article/${stickyArticle.slug}`}>Lire plus</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="col-span-1 flex flex-col gap-6">
              <Verbatim />
            </div>



        <div className="col-span-3 grid grid-cols-6 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        </div>
      )}
    </main>
  )
}