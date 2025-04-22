import type { Metadata } from "next"
import Link from "next/link"
import { fetchCategories } from "@/lib/wordpress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Categories - WikiPress",
  description: "Browse all article categories in our knowledge base",
}

export default async function CategoriesPage() {
  const categories = await fetchCategories()

  // Sort categories by count (most articles first)
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Categories</h1>
        <p className="text-lg text-muted-foreground">
          Browse our articles by category to find the information you need.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/categories/${category.slug}`} className="hover:underline">
                  {category.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {category.description || `Browse articles in the ${category.name} category.`}
              </p>
              <p className="text-sm font-medium">
                {category.count} {category.count === 1 ? "article" : "articles"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
