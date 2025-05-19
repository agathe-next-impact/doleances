"use server"

import { z } from "zod"
import nodemailer from "nodemailer"

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
      "https://wp-starter.io/wp-json/wp/v2/pages?slug=contribuer",
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
  // Valider les données du formulaire
  const validatedData = formSchema.parse(formData)

  try {
    // Récupérer les emails destinataires depuis l'API
    const contactData = await getContactData()
    const recipientEmails: string[] = contactData.emails || []

    if (recipientEmails.length === 0) {
      throw new Error("Aucun email destinataire trouvé")
    }

    // Configuration de Nodemailer (à remplacer par vos propres informations SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "false",
      auth: {
        user: process.env.SMTP_USER || "am.agathe.martin@gmail.com",
        pass: process.env.SMTP_PASSWORD || "dvzhmncnrcljqntr",
      },
    })

    console.log("Transporteur Nodemailer créé avec succès")
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
          <p><strong>Nom:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          <p><strong>Objet:</strong> ${validatedData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${validatedData.message.replace(/\n/g, "<br>")}</p>
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
