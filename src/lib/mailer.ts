import nodemailer from "nodemailer";

// Configuration du transporteur avec des variables d'environnement
export async function sendEmail(to: string, subject: string, text: string, html?: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER, // Adresse Gmail
          pass: process.env.GMAIL_PASS, // Mot de passe ou App Password
        },
      });
      

  try {
    const info = await transporter.sendMail({
      from: '"Stage Permis" <noreply@stagepermis.com>', // Adresse de l'expéditeur
      to, // Destinataire
      subject, // Sujet de l'email
      text, // Contenu texte brut
      html, // Contenu HTML
    });

    console.log("Email envoyé :", nodemailer.getTestMessageUrl(info)); // Lien pour visualiser l'email
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    return false;
  }
}
