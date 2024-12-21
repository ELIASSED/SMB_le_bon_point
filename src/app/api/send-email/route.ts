import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, stageDetails } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail", // ou un autre service de messagerie
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmation d'inscription au stage",
    text: `Bonjour,\n\nVotre inscription au stage "${stageDetails}" a été confirmée.\n\nMerci !`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "E-mail envoyé avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error);
    return NextResponse.json({ error: "Échec de l'envoi de l'e-mail." }, { status: 500 });
  }
}
