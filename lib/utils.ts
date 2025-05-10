import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString) // dateString should be in ISO 8601 format (e.g., "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ")
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date).replace('.', '') // Remove period from short month
}

