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
      {/*<div>
        <h2 className="mb-4 text-lg font-semibold">Search</h2>
        <SearchAutocomplete
          placeholder="Rechercher des articles..."
          onSearch={handleSearch}
          redirectOnSelect={false}
          showButton={true}
        />
      </div>*/}
{/*}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Filters</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Categories</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className="w-full justify-between"
                >
                  {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "Select categories"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandList>
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.slug}
                          onSelect={() => toggleCategory(category.slug)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategories.includes(category.slug) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {category.name} ({category.count})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <Popover open={tagOpen} onOpenChange={setTagOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={tagOpen} className="w-full justify-between">
                  {selectedTags.length > 0 ? `${selectedTags.length} selected` : "Select tags"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {tags.map((tag) => (
                        <CommandItem key={tag.id} value={tag.slug} onSelect={() => toggleTag(tag.slug)}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTags.includes(tag.slug) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {tag.name} ({tag.count})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {(selectedCategories.length > 0 || selectedTags.length > 0 || searchTerm) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Active Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchTerm}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {selectedCategoryNames.map((name, index) => (
              <Badge key={`cat-${index}`} variant="secondary" className="flex items-center gap-1">
                {name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeCategory(selectedCategories[index])} />
              </Badge>
            ))}
            {selectedTagNames.map((name, index) => (
              <Badge key={`tag-${index}`} variant="secondary" className="flex items-center gap-1">
                {name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(selectedTags[index])} />
              </Badge>
            ))}
          </div>
        </div>
      )}*/}

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
