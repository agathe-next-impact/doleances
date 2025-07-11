"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Category {
  id: number
  name: string
  slug: string
  count: number
}

interface Tag {
  id: number
  name: string
  slug: string
  count: number
}

interface ArticleFiltersProps {
  categories: Category[]
  tags: Tag[]
  selectedFilters: {
    category?: string | string[]
    tag?: string | string[]
    search?: string
    page?: string
  }
}

export function ArticleFilters({ categories, tags, selectedFilters }: ArticleFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState(selectedFilters.search || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(selectedFilters.category)
      ? selectedFilters.category
      : selectedFilters.category
        ? [selectedFilters.category]
        : [],
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    Array.isArray(selectedFilters.tag) ? selectedFilters.tag : selectedFilters.tag ? [selectedFilters.tag] : [],
  )
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    // Add selected categories
    if (selectedCategories.length > 0) {
      selectedCategories.forEach((category) => {
        params.append("category", category)
      })
    }

    // Add selected tags
    if (selectedTags.length > 0) {
      selectedTags.forEach((tag) => {
        params.append("tag", tag)
      })
    }

    // Add search term
    if (searchTerm) {
      params.set("search", searchTerm)
    }

    // Reset to page 1 when filters change
    params.set("page", "1")

    // Update URL
    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`)
  }, [selectedCategories, selectedTags, searchTerm, pathname, router])

  // Handle search form submission
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Handle category selection
  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((c) => c !== slug)
      } else {
        return [...prev, slug]
      }
    })
  }

  // Handle tag selection
  const toggleTag = (slug: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((t) => t !== slug)
      } else {
        return [...prev, slug]
      }
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTags([])
    setSearchTerm("")
  }

  // Remove a specific category
  const removeCategory = (slug: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== slug))
  }

  // Remove a specific tag
  const removeTag = (slug: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== slug))
  }

  // Get selected category names for display
  const selectedCategoryNames = selectedCategories.map((slug) => {
    const category = categories.find((c) => c.slug === slug)
    return category ? category.name : slug
  })

  // Get selected tag names for display
  const selectedTagNames = selectedTags.map((slug) => {
    const tag = tags.find((t) => t.slug === slug)
    return tag ? tag.name : slug
  })

  return (
    <div className="space-y-6">

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger>All Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(category.slug)}
                    className={cn(
                      "text-sm hover:underline",
                      selectedCategories.includes(category.slug) ? "font-medium" : "",
                    )}
                  >
                    {category.name}
                  </button>
                  <span className="text-xs text-muted-foreground">{category.count}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tags">
          <AccordionTrigger>All Tags</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.slug) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.slug)}
                >
                  {tag.name} ({tag.count})
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
