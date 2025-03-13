// lib/mailer.ts
import nodemailer from "nodemailer";
import { env } from "./env";

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  try {
    console.log("Configuration de Nodemailer avec :", {
      service: "gmail",
      user: env.EMAIL_USER,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    console.log("Envoi de l'email avec options :", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès :", result);
    return result;
  } catch (error: any) {
    console.error("Erreur dans sendEmail :", error.message, error.stack);
    throw error;
  }
}