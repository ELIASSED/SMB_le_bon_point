// api/send-mail.ts
import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/mailer";
import { env } from "../../../lib/env"; // Import manuel

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, text, html } = body;

    console.log("Données reçues dans /api/send-mail :", {
      to,
      subject,
      text,
      html: html.substring(0, 100) + "...",
    });

    if (!to || !subject || !text || !html) {
      console.log("Champs manquants dans la requête");
      throw new Error("Les champs 'to', 'subject', 'text' et 'html' sont obligatoires.");
    }

    console.log("Variables d'environnement :", {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    });

    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
      throw new Error("Les variables d'environnement EMAIL_USER ou EMAIL_PASS ne sont pas définies.");
    }

    console.log("Appel à sendEmail...");
    const emailResult = await sendEmail(to, subject, text, html);
    console.log("Résultat de l'envoi d'email :", emailResult);

    return NextResponse.json({ success: true, message: "Email envoyé avec succès", emailResult });
  } catch (error: any) {
    console.error("Erreur d'envoi d'email dans /api/send-mail :", error.message, error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}