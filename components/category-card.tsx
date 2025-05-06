"use client"

import { type Category, type Post, fetchRecentPostsByCategory } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
        console.error(`Error fetching recent posts for category ${category.id}:`, err)
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
  }, [category.id])

  const imageUrl =
    category.acf?.image_categorie || `/placeholder.svg?height=200&width=400&query=Category ${category.name}`

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          <Link href={`/category/${category.id}`} className="hover:underline">
            {category.name}
          </Link>
        </CardTitle>
        <CardDescription dangerouslySetInnerHTML={{ __html: category.description }} className="line-clamp-2" />
      </CardHeader>
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={category.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="flex-grow pt-4">
        <h3 className="font-medium mb-2">Articles récents:</h3>
        {loading ? (
          <p>Chargement des articles...</p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : recentPosts.length > 0 ? (
          <ul className="space-y-2">
            {recentPosts.map((post) => (
              <li key={post.id} className="text-sm">
                <Link href={`/article/${post.id}`} className="hover:underline">
                  <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun article disponible</p>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/category/${category.id}`} className="text-sm text-primary hover:underline">
          Voir tous les articles ({category.count})
        </Link>
      </CardFooter>
    </Card>
  )
}
