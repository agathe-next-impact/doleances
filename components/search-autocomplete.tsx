"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, FileText, File } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchSearchSuggestions } from "@/lib/wordpress"
import { cn } from "@/lib/utils"

interface SearchSuggestion {
  id: number
  title: string
  slug: string
  type: "article" | "page"
}

interface SearchAutocompleteProps {
  placeholder?: string
  className?: string
  onSearch?: (term: string) => void
  redirectOnSelect?: boolean
  buttonLabel?: string
  showButton?: boolean
}

export function SearchAutocomplete({
  placeholder = "Rechercher...",
  className,
  onSearch,
  redirectOnSelect = true,
  buttonLabel = "Rechercher",
  showButton = true,
}: SearchAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounce search term
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await fetchSearchSuggestions(searchTerm)
        const combinedResults = [...results.articles, ...results.pages]
        setSuggestions(combinedResults)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prevIndex) => (prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex))
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0))
    }
    // Enter
    else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0) {
        handleSuggestionSelect(suggestions[selectedIndex])
      } else {
        handleSearch()
      }
    }
    // Escape
    else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm)
      } else if (redirectOnSelect) {
        router.push(`/articles?search=${encodeURIComponent(searchTerm)}`)
      }
      setShowSuggestions(false)
    }
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (redirectOnSelect) {
      if (suggestion.type === "article") {
        router.push(`/articles/${suggestion.slug}`)
      } else {
        router.push(`/pages/${suggestion.slug}`)
      }
    } else if (onSearch) {
      onSearch(suggestion.title)
      setSearchTerm(suggestion.title)
    }
    setShowSuggestions(false)
  }

  return (
    <div className={cn("relative", className)} ref={searchRef}>
      <div className="relative flex w-full items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowSuggestions(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {showButton && (
          <Button type="button" onClick={handleSearch} className="ml-2 bg-lime-600 text-white hover:bg-lime-600/80">
            {buttonLabel}
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.type}-${suggestion.id}`}>
                <button
                  className={cn(
                    "flex w-full items-center px-4 py-2 text-left text-sm hover:bg-accent",
                    selectedIndex === index && "bg-accent",
                  )}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.type === "article" ? (
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <File className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span>
                    {suggestion.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {suggestion.type === "article" ? "Article" : "Page"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
