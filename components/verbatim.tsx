"use client";

import { useEffect, useState, useRef } from "react";
import { fetchRandomVerbatim } from "@/lib/api";
import type { Verbatim } from "@/lib/api";
import DateFormat from "@/components/date-format";
import { motion } from "framer-motion";
import LottieAnimation from "./ui/lottie-animation";

export default function Verbatim() {
  const [verbatim, setVerbatim] = useState<Verbatim | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullVerbatim, setShowFullVerbatim] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowFullVerbatim(false);
      }
    };

    if (showFullVerbatim) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFullVerbatim]);

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
    <div className="flex flex-col">
      <div className="text-gray-700 mb-8 text-xl font-handwritten prose prose-sm max-w-none">
          <div style={{ wordBreak: "break-word" }}>
            {verbatim.acf.texte_du_verbatim
              ? `${verbatim.acf.texte_du_verbatim.slice(0, 150)}${verbatim.acf.texte_du_verbatim.length > 150 ? "..." : ""}`
              : ""}
            {showFullVerbatim && (
              <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
              >
              <div
                ref={popupRef}
                className="bg-white p-6 rounded-lg max-w-2xl w-full relative"
              >
                <LottieAnimation animationPath="/animations/note.json" width="80px" height="80px"/>
                <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowFullVerbatim(false)}
                >
                </button>
                <p className="font-handwritten text-lg">
                {verbatim.acf.texte_du_verbatim}
                </p>
                
                <p className="mt-8 font-serif font-medium text-xl text-right">
                {verbatim.acf.departement}
                </p>
                {verbatim.acf.date ? (
                <p className="font-serif text-xl text-right">
                  <DateFormat dateStr={verbatim.acf.date || ""} short={true} />
                </p>
                ) : (
                ""
                )}
              </div>
              </motion.div>
            )}
        </div>
      </div>
      <p className="font-serif font-medium text-xl text-right">
        {verbatim.acf.departement}
      </p>
      {verbatim.acf.date ? (
        <p className="font-serif text-xl text-right">
          <DateFormat dateStr={verbatim.acf.date || ""} short={true} />
        </p>
      ) : (
        ""
      )}
      {verbatim.acf?.texte_du_verbatim.length > 150 && ( 
      <button
        className="item-right text-right mt-4 uppercase font-medium text-sm text-primary hover:text-primary-foreground"
        onClick={() => setShowFullVerbatim(true)}
      >
        Lire la suite
      </button>
      )
      }

    </div>
  );
}