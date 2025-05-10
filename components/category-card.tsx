"use client"

import { type Category, type Post, fetchRecentPostsByCategory } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DateFormat, { TimeFormat } from "./date-format"

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

console.log(recentPosts)

  return (
    <Card className="h-full flex flex-col overflow-hidden border shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          <Link href={`/category/${category.slug}`}>
            {category.name}
          </Link>
        </CardTitle>
        <CardDescription dangerouslySetInnerHTML={{ __html: category.description }} className="line-clamp-2" />
      </CardHeader>
      {/*
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      */}
      <CardContent className="flex-grow pt-4">
        {loading ? (
          <p>Chargement des articles...</p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : recentPosts.length > 0 ? (
          <ul className="space-y-6">
            {recentPosts.map((post) => (
              <li key={post.id} className="text-sm">
                <Link href={`/article/${post.slug}`} className="flex gap-6">
                  <div className="relative h-16 w-1/3 mb-2">
                    <Image
                      src={post._embedded?.["wp:featuredmedia"][0].source_url || "/placeholder.svg"}
                      alt={post.title.rendered}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-col justify-between w-2/3">
                    <div dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    {!post.acf?.date_de_levenement && (
                    <div 
                      className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {post.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, "")}
                    </div>
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
        <Link href={`/category/${category.slug}`} className="text-sm text-muted-foreground hover:underline">
          {category.name} : Voir tout
        </Link>
      </CardFooter>
    </Card>
  )
}