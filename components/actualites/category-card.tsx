"use client"

import { type Category, type Post, fetchRecentPostsByCategory } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DateFormat, { TimeFormat } from "@/components/date-format"

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadRecentPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        const posts = await fetchRecentPostsByCategory(category.id)
        
        if (isMounted) {
          setRecentPosts(posts)
          setLoading(false)
        }
      } catch (err) {
        console.error(`Error fetching recent posts for category ${category.slug}:`, err)
        if (isMounted) {
          setError("Impossible de charger les articles récents.")
          setLoading(false)
        }
      }
    }

    loadRecentPosts()

    return () => {
      isMounted = false
    }
  }, [category.slug])

  return (
    <Card className="md:col-span-3 col-span-6 h-full flex flex-col overflow-hidden border shadow-lg cards">
      <CardHeader className="pb-2">
        <CardTitle className="w-full mb-4 pb-3 text-2xl font-serif font-light uppercase border-b-[1px]">
          <Link href={`/category/${category.slug}`}>
            {category.name}
          </Link>
        </CardTitle>
        <CardDescription dangerouslySetInnerHTML={{ __html: category.description }} className="line-clamp-2" />
      </CardHeader>
      <CardContent className="flex-grow pt-4 cards">
        {loading ? (
          <p>Chargement des articles...</p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : recentPosts.length > 0 ? (
          <ul className="space-y-10">
            {recentPosts.slice(0, 2).map((post) => (
              <li key={post.id} className="text-sm">
                <Link href={`/article/${post.slug}`} className="flex md:gap-8 gap-2 md:flex-row flex-col">
                  <div className="relative h-28 md:w-1/3 w-full mb-2">
                    <Image
                      src={post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "/img/doleance_couv.png"}
                      alt={post.title.rendered}
                      fill
                      className="object-cover rounded border shadow-sm"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-col md:w-2/3 w-full text-lg">
                    <div className="font-semibold" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    {!post.acf?.date_de_levenement && (
                      <div 
                        className="text-muted-foreground mb-4"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} 
                      /> 
                    )} 
                    <div className="text-xs text-muted-foreground">
                    {post.acf?.date_de_levenement && (
                      <div className="flex items-center gap-1.5">
                        <span><DateFormat dateStr={post.acf.date_de_levenement} /></span>
                      </div>
                    )}
                    {post.acf?.heure_de_levenement && (
                      <div className="flex items-center gap-1.5">
                        <span><TimeFormat timeStr={post.acf.heure_de_levenement} /></span>
                      </div>
                    )}
                    {post.acf?.lieu_de_levenement && (
                      <div className="flex items-center gap-1.5">
                        <span>{post.acf.lieu_de_levenement.address}</span>
                      </div>
                    )}
                    {post.date && (
                      <div className="flex items-center gap-1.5">
                        <span><DateFormat dateStr={post.date} /></span>
                        </div>
                    )}
                  </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun article disponible</p>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/category/${category.slug}`} className="text-sm text-primary uppercase mx-auto text-base font-medium underline-offset-4 underline hover:opacity-80">
          Voir tout
        </Link>
      </CardFooter>
    </Card>
  )
}