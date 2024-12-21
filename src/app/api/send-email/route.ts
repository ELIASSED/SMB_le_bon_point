import { sendEmail } from "../../../lib/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { email, subject, text, html } = req.body;

  try {
    const emailSent = await sendEmail(email, subject, text, html);

    if (emailSent) {
      return res.status(200).json({ message: "Email envoyé avec succès." });
    } else {
      throw new Error("Échec de l'envoi de l'email.");
    }
  } catch (error) {
    console.error("Erreur dans l'API d'email :", error);
    return res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
  }
}
