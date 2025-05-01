import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    console.log("Requête reçue dans /api/send-mail");
    const body = await req.json();
    console.log("Données reçues:", body);

    const { to, subject, text, html } = body;

    if (!to || !subject || !text || !html) {
      console.log("Champs manquants:", { to, subject, text, html });
      throw new Error("Les champs 'to', 'subject', 'text' et 'html' sont obligatoires.");
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error("La variable d'environnement RESEND_API_KEY n'est pas définie.");
    }

    console.log("Initialisation de Resend...");
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("Resend initialisé avec succès");

    console.log("Envoi de l’email via Resend à:", to);
    const { data, error } = await resend.emails.send({
      from: "no-reply@smb-lebonpoint.fr", // Use your verified domain
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Erreur de Resend:", {
        message: error.message,
        name: error.name,
      });
      throw new Error(error.message || "Échec de l’envoi de l’email");
    }

    console.log("Email envoyé avec succès:", data);
    return NextResponse.json({ success: true, message: "Email envoyé avec succès", emailResult: data });
  } catch (error: any) {
    console.error("Erreur dans /api/send-mail:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}