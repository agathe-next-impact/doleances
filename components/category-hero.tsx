import type { Category } from "@/lib/api"

interface CategoryHeroProps {
  category: Category
}

export default function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{category.name}</h1>
      {category.description && (
        <div
          className="max-w-2xl mx-auto text-sm md:text-base text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: category.description }}
        />
      )}
    </div>
  )
}
