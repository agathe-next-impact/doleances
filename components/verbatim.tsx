// récuperer le contenu d'un verbatim de façon aléatoire https://palegreen-capybara-652133.hostingersite.com/wp-json/wp/v2/verbatim
// et l'afficher dans un composant

"use client";

import { useEffect, useState } from "react";
import { fetchRandomVerbatim } from "@/lib/api";
import type { Verbatim } from "@/lib/api";
import DateFormat from "@/components/date-format";

export default function Verbatim() {
  const [verbatim, setVerbatim] = useState<Verbatim | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadVerbatim = async () => {
      setLoading(true);
      setError(null);

      try {
        const randomVerbatim = await fetchRandomVerbatim(); 
       
        setVerbatim(randomVerbatim);
      } catch (err) {
        setError("Impossible de charger un verbatim.");
      } finally {
        setLoading(false);
      }
    };

    loadVerbatim();
  }, []);

  if (loading) {
    return <p>Chargement d'un verbatim...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!verbatim) {
    return <p>Aucun verbatim disponible.</p>;
  }

  return (
    <div className="p-4">
      <div className="text-gray-700 mb-8 text-2xl font-handwritten prose prose-sm max-w-none">
        <span style={{ wordBreak: "break-word" }}>
          {verbatim.acf.texte_du_verbatim || ""}
        </span></div>
        <p className="font-serif font-medium text-xl text-right">{verbatim.acf.departement}</p>
        <p className="font-serif text-xl text-right"><DateFormat dateStr={verbatim.acf.date || ""} short={true} /></p>
    </div>
  );
}