import { Resend } from "resend";
import { generateConfirmationEmail } from "./emailUtils";

interface ConfirmationEmailProps {
  to: string;
  prenom: string;
  nom: string;
  location: string;
  numeroStageAnts: string;
  startDate: string;
  endDate: string;
  supportEmail: string;
  supportPhone?: string;
}

export async function sendConfirmationEmail({
  to,
  prenom,
  nom,
  location,
  numeroStageAnts,
  startDate,
  endDate,
  supportEmail,
  supportPhone,
}: ConfirmationEmailProps) {
  try {
    console.log("Démarrage de sendConfirmationEmail...");
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY n'est pas défini dans les variables d'environnement");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("Resend initialisé avec succès");

    const htmlContent = generateConfirmationEmail(
      prenom,
      nom,
      location,
      numeroStageAnts,
      startDate,
      endDate,
      supportEmail,
      supportPhone
    );

    console.log("Envoi de l'email via Resend à:", to);
    const { data, error } = await resend.emails.send({
      from: "no-reply@votre-domaine.com", // Use your verified domain
      to,
      subject: "Confirmation de votre inscription au stage",
      html: htmlContent,
    });

    if (error) {
      console.error("Erreur de l'API Resend:", {
        message: error.message,
        name: error.name,
      });
      throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }

    console.log("Email envoyé avec succès:", data);
    return data;
  } catch (error: any) {
    console.error("Erreur dans sendConfirmationEmail:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}