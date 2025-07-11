"use client";

import type React from "react";
import type { GroupeLocalPost } from "@/lib/api";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Calendar } from "lucide-react";

interface SearchFilterProps {
  dates: string[];
  groupesLocauxCPT: GroupeLocalPost[];
  categoryId: number;
  isEventCategory?: boolean;
}

export default function SearchFilter({
  dates,
  groupesLocauxCPT,
  categoryId,
  isEventCategory = false,
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialiser les états avec les valeurs des paramètres d'URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [groupeLocalFilter, setGroupeLocalFilter] = useState(searchParams.get("groupe_local_cpt") || "");


  // Fonction pour créer une nouvelle URL avec les paramètres de recherche
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      // Mettre à jour ou supprimer les paramètres
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      return newParams.toString();
    },
    [searchParams]
  );

  // Fonction pour mettre à jour l'URL immédiatement
  const updateUrl = useCallback(
    (params: Record<string, string | null>) => {
      const queryString = createQueryString(params);
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
    },
    [createQueryString, pathname, router]
  );

  // Gestionnaire pour la saisie dans le champ de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value); // Met à jour immédiatement l'état local
    updateUrl({ q: value }); // Met à jour l'URL immédiatement
  };

  // Gestionnaire pour le changement de date
  const handleDateChange = (value: string) => {
    // Vérifier si la valeur est une date valide
    setDateFilter(value);
    // formatte la date en nombre
    updateUrl({ date: value });
  };

// Gestionnaire pour le changement de groupe local
const handleGroupeLocalChange = (value: string) => {
  setGroupeLocalFilter(value);
  updateUrl({ groupe_local_cpt: value }); // value est maintenant le slug
};

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setGroupeLocalFilter("");
    router.push(pathname);
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchQuery || dateFilter || groupeLocalFilter;

  // Formater les dates pour l'affichage dans le filtre
  const formatDateForDisplay = (dateString: string) => {
    try {
      const [month, year] = dateString.split("/").map(Number);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="py-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>

        {dates.length > 0 && (
          <Select value={dateFilter} onValueChange={handleDateChange}>
            <SelectTrigger className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={isEventCategory ? "Filtrer par mois d'événement" : "Filtrer par date"} />
            </SelectTrigger>
            <SelectContent>
              {dates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDateForDisplay(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {!isEventCategory && groupesLocauxCPT.length > 0 && (
          <Select value={groupeLocalFilter} onValueChange={handleGroupeLocalChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par groupe local" />
            </SelectTrigger>
            <SelectContent>
              {groupesLocauxCPT.map((groupe) => (
                <SelectItem key={groupe.id} value={groupe.id.toString()}>
                  {groupe.title.rendered}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <div className="md:col-span-3 flex justify-end">
            <Button variant="outline" onClick={resetFilters} size="sm" className="flex items-center gap-1">
              <X className="h-4 w-4" />
              <span>Réinitialiser les filtres</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}