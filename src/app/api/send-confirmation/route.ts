import { NextResponse } from "next/server";
import { sendConfirmationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
   // console.log("Requête reçue dans /api/send-confirmation");
    const body = await req.json();
   // console.log("Données reçues:", body);

    const { to, prenom, nom, location, numeroStageAnts, startDate, endDate, supportEmail, supportPhone } = body;

    // Validation des champs
    if (!to || !prenom || !nom || !location || !numeroStageAnts || !startDate || !endDate || !supportEmail) {
     // console.log("Champs manquants:", { to, prenom, nom, location, numeroStageAnts, startDate, endDate, supportEmail });
      return NextResponse.json({ success: false, error: "Tous les champs obligatoires doivent être fournis" }, { status: 400 });
    }

    console.log("Appel de sendConfirmationEmail...");
    const result = await sendConfirmationEmail({
      to,
      prenom,
      nom,
      location,
      numeroStageAnts,
      startDate,
      endDate,
      supportEmail,
      supportPhone: supportPhone || "",
    });

    console.log("Résultat de sendConfirmationEmail:", result);
    return NextResponse.json({ success: true, message: "Email envoyé avec succès", data: result });
  } catch (error: any) {
    console.error("Erreur dans /api/send-confirmation:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}