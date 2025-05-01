import { fetchCategories } from "@/lib/api"
import CategoryCard from "@/components/category-card"

export default async function Home() {
  const categories = await fetchCategories()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Catégories d'articles</h1>
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </main>
  )
}