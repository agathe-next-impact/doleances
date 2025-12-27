import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { decode } from 'he';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString) // dateString should be in ISO 8601 format (e.g., "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ")
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date).replace('.', '') 
}

/**
 * Décode tout texte WordPress pour afficher correctement les caractères spéciaux et entités HTML.
 * Utiliser cette fonction pour tout contenu textuel provenant de la base WordPress.
 */
export function decodeWordPressText(text: string): string {
  if (!text) return '';
  // Utilise 'he' pour décoder toutes les entités HTML (y compris &#8230;)
  return decode(text);
}




