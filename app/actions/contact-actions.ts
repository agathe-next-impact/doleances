"use server"

import { z } from "zod"
import nodemailer from "nodemailer"
import { headers } from "next/headers"
import { API_BASE_URL } from "@/lib/constants"

/** Échappe les caractères HTML pour prévenir les injections XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Rate limiting simple en mémoire (par IP) */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 5 // max 5 emails
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // par fenêtre de 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

// Schéma de validation
const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

// Type pour les données du formulaire
type FormData = z.infer<typeof formSchema>

// Fonction pour récupérer les données de l'API
export async function getContactData() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/pages?slug=contribuer`,
      { next: { revalidate: 3600 } }, // Revalider toutes les heures
    )

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des données: ${response.status}`)
    }

    const data = await response.json()

    // Vérifier si la réponse est un tableau et s'il contient au moins un élément
    if (!Array.isArray(data) || data.length === 0) {
      console.error("La réponse API n'est pas un tableau ou est vide:", data)
      return { emails: [], subjects: [] }
    }


    // Vérifier si l'élément a une propriété acf
    if (data[0].acf) {
      // Vérifier et récupérer les emails
      const emails = Array.isArray(data[0].acf.emails_de_destination) ? data[0].acf.emails_de_destination : []

      // Vérifier et traiter les objets de message
      let subjects: string[] = []

      if (Array.isArray(data[0].acf.objets_de_message)) {
        // Traiter chaque objet de message
        subjects = data[0].acf.objets_de_message.map((item: any) => {
          // Si l'item est un objet avec une propriété nouvel_objet
          if (typeof item === "object" && item !== null && item.nouvel_objet) {
            return item.nouvel_objet
          }
          // Si l'item est une chaîne de caractères
          else if (typeof item === "string") {
            return item
          }
          // Pour tout autre cas, utiliser JSON.stringify
          else {
            return JSON.stringify(item)
          }
        })
      }

      return { emails, subjects }
    }

    // Si acf n'existe pas, vérifier acfr
    if (data[0].acfr) {
      return {
        emails: data[0].acfr.emails || [],
        subjects: data[0].acfr.subjects || [],
      }
    }

    // Si aucune des propriétés attendues n'est trouvée, afficher les propriétés disponibles
    console.error(
      "Propriétés disponibles dans le premier élément:",
      Object.keys(data[0]),
      "Contenu du premier élément:",
      JSON.stringify(data[0], null, 2),
    )

    // Retourner des valeurs par défaut
    return {
      emails: [process.env.DEFAULT_RECIPIENT_EMAIL || "contact@example.com"],
      subjects: ["Information", "Support", "Autre"],
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error)
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      emails: [process.env.DEFAULT_RECIPIENT_EMAIL || "contact@example.com"],
      subjects: ["Information", "Support", "Autre"],
    }
  }
}

// Fonction pour envoyer le formulaire de contact
export async function sendContactForm(formData: FormData) {
  // Rate limiting
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!checkRateLimit(ip)) {
    return {
      success: false,
      message: "Trop de messages envoyés. Veuillez réessayer dans quelques minutes.",
    }
  }

  // Valider les données du formulaire
  const validatedData = formSchema.parse(formData)

  try {
    // Récupérer les emails destinataires depuis l'API
    const contactData = await getContactData()
    const recipientEmails: string[] = contactData.emails || []

    if (recipientEmails.length === 0) {
      throw new Error("Aucun email destinataire trouvé")
    }

    // Configuration SMTP — les variables d'environnement sont obligatoires
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error("Configuration SMTP manquante")
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    
    let emailsList = "";
    recipientEmails.forEach(email => {
      emailsList += email.email_de_destination + ", ";
    });

    // Envoyer l'email
    await transporter.sendMail({
      from: "Formulaire de contact des doléances",
      to: emailsList,
      subject: `Nouveau message: ${validatedData.subject}`,
      text: `
        Nom: ${validatedData.name}
        Email: ${validatedData.email}
        Objet: ${validatedData.subject}

        Message:
        ${validatedData.message}
      `,
      html: `
        <div>
          <p><strong>Nom:</strong> ${escapeHtml(validatedData.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(validatedData.email)}</p>
          <p><strong>Objet:</strong> ${escapeHtml(validatedData.subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(validatedData.message).replace(/\n/g, "<br>")}</p>
        </div>
      `,
    })

    return { success: true, message: "Email envoyé avec succès" }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    return {
      success: false,
      message: "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.", 
    }

  }
}
