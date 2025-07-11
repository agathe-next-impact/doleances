"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type PopupImageProps = {
  image: string;
};

export default function PopupImage({ image }: PopupImageProps) {
  const [showProgramme, setShowProgramme] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Gestion de la fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowProgramme(false);
      }
    };
    if (showProgramme) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProgramme]);

    // Gestion de la fermeture au clic sur la touche "Echap"
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
            setShowProgramme(false);
            }
        };
        if (showProgramme) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
        }
    , [showProgramme]);

  return (
    <>
      <div className="w-min pb-6 px-6 mx-auto">
        <Button
          variant="outline"
          className="w-min"
          onClick={() => setShowProgramme(true)}
        >
          Programme
        </Button>
      </div>

      {/* Popup animé pour l'image */}
      {showProgramme && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
        >
          <div
            ref={popupRef}
            className="bg-white p-8 rounded-lg max-w-2xl w-max relative shadow-lg"
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 "
              onClick={() => {
                setShowProgramme(false);
              }}
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={image}
              alt="Programme du festival"
              className="w-full h-[80vh] rounded-lg object-contain"
            />
          </div>
        </motion.div>
      )}
    </>
  );
}