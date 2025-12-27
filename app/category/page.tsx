import { fetchCategories, fetchLastThreePosts } from "@/lib/api"
import CategoryCard from "@/components/actualites/category-card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, User2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDate, decodeWordPressText } from "@/lib/utils"
import Verbatim from "@/components/verbatim"
import type { Metadata } from "next"


export const metadata: Metadata = {
  title: "Actualités - Les Doléances",
  description: "L'actualité des doléances",
  openGraph: {
    title: "Actualités - Les Doléances",
    description: "L'actualité des doléances",
    images: [
      {
        url: "https://www.doleances.fr/img/doleances_couv.png",
        alt: "Actualités - Les Doléances",
      },
    ],
  },
}


export default async function Home() {
  const categories = await fetchCategories()
  categories.sort((a, b) => b.count - a.count)
  const articles = await fetchLastThreePosts()
  const stickyArticle = articles[0]

  return (
    <>
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[100px] left-0 h-[500px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[500px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
    <main className="container mx-auto md:p-8 p-4">
        <div className="py-4 text-center">
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
              {stickyArticle && (
                <div className="lg:col-span-2 col-span-3 flex row-span-2 rounded-lg border bg-card shadow-lg overflow-hidden">
                  {stickyArticle.featuredImage && (
                  <div className="relative md:block h-full lg:basis-[30%] hidden">
                    <Image
                      src={
                        typeof stickyArticle.featuredImage === "string"
                          ? stickyArticle.featuredImage
                          : "/img/doleance_couv.png"
                      }
                      alt={
                        typeof stickyArticle.title === "string"
                          ? stickyArticle.title
                          : stickyArticle.title?.rendered || ""
                      }
                      fill
                      className="object-cover object-center "
                    />
                  </div>
                  )}

                  <div className="flex flex-col lg:basis-[70%] basis-full p-6">
                    <h2 className="mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">à la une</h2>
                    <>
                      <h3 className="mb-2 font-medium">
                        <Link href={`/article/${typeof stickyArticle.slug === "string" ? stickyArticle.slug : stickyArticle.slug?.rendered || ""}`}>
                          {decodeWordPressText(
                            typeof stickyArticle.title === "string"
                              ? stickyArticle.title
                              : stickyArticle.title?.rendered || ""
                          ).replace(/<[^>]+>/g, "")}
                        </Link>
                      </h3>
                      <div
                        className="mb-4 flex-grow text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: decodeWordPressText(
                            typeof stickyArticle.excerpt === "string"
                              ? stickyArticle.excerpt
                              : stickyArticle.excerpt?.rendered || ""
                          ),
                        }}
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {stickyArticle.categories && stickyArticle.categories[0] && (
                          <Badge variant="secondary" className="mx-0">
                            <Link href={`/category/${stickyArticle.categoriesSlug[0]}`}>
                              {stickyArticle.categories[0]}
                            </Link>
                          </Badge>
                        )}
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
                    </>
                  </div>
                </div>
              )}
            <div className="md:col-span-1 col-span-3 lg:flex flex-col hidden my-8 gap-6">
              <Verbatim />
            </div>


    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[700px] left-0 h-[400px] w-[50vw] rounded-full bg-gradient-to-r from-pink-200 to-blue-200 opacity-20 blur-3xl"></div>
      <div className="absolute top-[1000px] right-0 h-[400px] w-[40vw] rounded-full bg-gradient-to-r from-blue-200 to-pink-200 opacity-20 blur-3xl"></div>
    </div>
        <div className="col-span-3 grid grid-cols-6 gap-6">
          {categories.map((category) => (
            category.count > 0 && (
            <CategoryCard key={category.id} category={category}/>
            )
          ))}
        </div>

        </div>
      )}
    </main>
    </>
  )
}