import { PageCard } from "@/components/page-card"

interface Page {
  id: number
  slug: string
  title: string
  excerpt: string
  featuredImage?: string
  date: string
  modified: string
}

interface PageGridProps {
  pages: Page[]
  columns?: 2 | 3
}

export function PageGrid({ pages, columns = 2 }: PageGridProps) {
  return (
    <div className={`grid gap-6 md:grid-cols-${columns}`}>
      {pages.map((page) => (
        <PageCard key={page.id} page={page} />
      ))}
    </div>
  )
}
