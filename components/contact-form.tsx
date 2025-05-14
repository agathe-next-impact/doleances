"use client";

import { useState } from "react";

interface ContactFormProps {
  page: {
    title: string; // Titre de la page
    acf?: {
      objets_de_message: string[]; // Liste des sujets de message
      emails_de_destination: string[]; // Liste des emails de destination
    };
  };
}

export default function ContactForm({ page }: ContactFormProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "", subject: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Envoi...");

    // Récupérer les emails de destination depuis le champ ACF
    const recipients = page.acf?.emails_de_destination || [];

    if (recipients.length === 0) {
      setStatus("Aucune adresse email de destination spécifiée.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recipients, // Envoyer toutes les adresses email
        }),
      });

      if (res.ok) {
        setStatus("Message envoyé !");
        setFormData({ name: "", email: "", message: "", subject: "" });
      } else {
        setStatus("Erreur lors de l'envoi.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire :", error);
      setStatus("Erreur lors de l'envoi.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          required
          placeholder="Nom"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <select
          name="subject"
          required
          className="w-full border p-2 rounded"
          value={formData.subject}
          onChange={handleChange}
        >
          <option value="" disabled>
            Choisissez un sujet
          </option>
          {page.acf?.objets_de_message?.map((subject: string, index: number) => (
            <option key={index} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <textarea
          name="message"
          required
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Envoyer
        </button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}