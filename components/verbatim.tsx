"use client";

import { useEffect, useState, useRef } from "react";
import type { Verbatim as VerbatimType } from "@/lib/api";
import DateFormat from "@/components/date-format";
import { motion } from "framer-motion";
import LottieAnimation from "./ui/lottie-animation";

interface VerbatimProps {
  verbatim: VerbatimType | null;
}

export default function Verbatim({ verbatim }: VerbatimProps) {
  const [showFullVerbatim, setShowFullVerbatim] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

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
      {verbatim.acf?.departement && (
        <p className="font-serif font-medium text-xl text-right">
          {verbatim.acf.departement}
        </p>
          )
      }
        {verbatim.acf.date ? (
          <p className="font-serif text-xl text-right">
            <DateFormat dateStr={verbatim.acf.date || ""} short={true} />
          </p>
        ) : (
          ""
        )}
            {verbatim.acf?.texte_du_verbatim.length > 150 && (
      <button
        className="item-right text-right uppercase font-medium text-sm text-primary underline-offset-4 hover:underline"
        onClick={() => setShowFullVerbatim(true)}
      >
        Lire la suite
      </button>
      )
      }

    </div>
  );
}
