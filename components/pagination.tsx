"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string | string[] | undefined>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  // Create URL with current search params but updated page
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()

    // Add all existing search params except page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else if (value) {
          params.append(key, value)
        }
      }
    })

    // Add the new page
    params.set("page", page.toString())

    return `${baseUrl}?${params.toString()}`
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []

    // Always show first page
    pages.push(1)

    // Calculate range around current page
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push("ellipsis-start")
    }

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push("ellipsis-end")
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="mx-auto flex w-full items-center justify-center space-x-2">
      <Button variant="outline" size="icon" disabled={currentPage <= 1} asChild={currentPage > 1}>
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {pageNumbers.map((page, i) => {
        // Handle ellipsis
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <Button key={`ellipsis-${i}`} variant="outline" size="icon" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )
        }

        // Handle numbered pages
        const pageNum = page as number
        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="icon"
            asChild={currentPage !== pageNum}
          >
            {currentPage !== pageNum ? (
              <Link href={createPageUrl(pageNum)} aria-label={`Page ${pageNum}`}>
                {pageNum}
              </Link>
            ) : (
              <span>{pageNum}</span>
            )}
          </Button>
        )
      })}

      <Button variant="outline" size="icon" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  )
}
