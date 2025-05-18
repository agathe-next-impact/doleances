import type { Category } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface CategoryHeroProps {
  category: Category
  description?: string
}

export default function CategoryHero({ category }: CategoryHeroProps) {

  return (
    <div className="rounded-lg pt-8 text-center">
        <div className="flex mb-4">
        <Badge variant="secondary">
          <Link href={`/category`}>
              Toutes les actualités
          </Link>
        </Badge>
        <div className="h-1 w-16 rounded-full" />
      </div>
      <h1 className="text-3xl md:text-4xl mb-4">{category}</h1>
      {category.description && (
        <div
          className="max-w-2xl mx-auto text-sm md:text-base text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: category.description }}
        />
      )}
    </div>
  )
}
