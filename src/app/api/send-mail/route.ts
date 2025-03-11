import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, text, html } = body;

    if (!to || !subject || !text || !html) {
      throw new Error("Les champs 'to', 'subject', 'text' et 'html' sont obligatoires.");
    }

    const emailResult = await sendEmail(to, subject, text, html);
    console.log("Résultat de l'envoi d'email :", emailResult); // Log pour débogage
    return NextResponse.json({ success: true, message: "Email envoyé avec succès", emailResult });
  } catch (error: any) {
    console.error("Erreur d'envoi d'email :", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}