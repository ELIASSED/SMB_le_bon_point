const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Service Gmail
  auth: {
    user: process.env.GMAIL_USER, // Adresse Gmail
    pass: process.env.GMAIL_PASS, // Mot de passe d'application
  },
});

/**
 * Fonction pour envoyer un email
 * @param {string} to - Destinataire de l'email
 * @param {string} subject - Sujet de l'email
 * @param {string} text - Texte brut de l'email
 * @param {string} html - Version HTML de l'email
 * @returns {boolean} - True si l'email est envoyé avec succès, sinon false
 */
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Stage Permis" <${process.env.GMAIL_USER}>`, // Expéditeur
      to, // Destinataire
      subject, // Sujet
      text, // Texte brut
      html, // Version HTML
    });
    console.log("Email envoyé avec succès :", info.messageId);
    return true;
  } catch (error) {
    console.error("Erreur d'envoi d'email :", error);
    return false;
  }
}

module.exports = { sendEmail };
