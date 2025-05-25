"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchSearchSuggestions } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onSearch?: (term: string) => void;
  redirectOnSelect?: boolean;
  buttonLabel?: string;
  showButton?: boolean;
}

export function SearchAutocomplete({
  placeholder = "Rechercher...",
  className,
  onSearch,
  redirectOnSelect = true,
  buttonLabel = "Rechercher",
  showButton = true,
}: SearchAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupedSuggestions, setGroupedSuggestions] = useState<{
    [category: string]: { id: number; title: string; slug: string }[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search term
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setGroupedSuggestions({});
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await fetchSearchSuggestions(searchTerm);
        setGroupedSuggestions(results.groupedArticles);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setGroupedSuggestions({});
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      if (onSearch) {
        onSearch(searchTerm);
      } else if (redirectOnSelect) {
        router.push(`/article?search=${encodeURIComponent(searchTerm)}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (id: number) => {
    if (redirectOnSelect) {
      router.push(`/article/${id}`);
    } else if (onSearch) {
      onSearch(slug);
    }
    setShowSuggestions(false);
  };

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
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {showButton && (
          <Button
            type="button"
            onClick={handleSearch}
            className="ml-2 bg-lime-600 text-white hover:bg-lime-600/80"
          >
            {buttonLabel}
          </Button>
        )}
      </div>

      {showSuggestions && Object.keys(groupedSuggestions).length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          <ul className="py-1 search">
            {Object.entries(groupedSuggestions).map(([category, articles]) => (
              <li key={category}>
                <div className="px-4 py-2 text-sm uppercase text-muted-foreground">
                  {category}
                </div>
                {articles.map((article) => (
                  <button
                    key={article.id}
                    className="flex w-full items-center px-4 py-2 ml-4 text-left text-sm hover:bg-accent"
                    onClick={() => handleSuggestionSelect(article.slug)}
                  >
                    {article.title
                      ? <span dangerouslySetInnerHTML={{ __html: article.title }} />
                      : article.slug}
                  </button>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}