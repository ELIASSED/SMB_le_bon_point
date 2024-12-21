import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../lib/mailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { stageId, userData, drivingLicenseData } = body;

    if (!stageId || !userData || !drivingLicenseData) {
      throw new Error("Données manquantes. Veuillez vérifier les champs requis.");
    }

    // Clean and format user data
    const { confirmationEmail, ...cleanUserData } = userData;
    const formattedUserData = {
      ...cleanUserData,
      dateNaissance: new Date(cleanUserData.dateNaissance),
    };

    // Format driving license data
    const formattedDrivingLicenseData = {
      ...drivingLicenseData,
      dateDelivrancePermis: new Date(drivingLicenseData.dateDelivrancePermis),
    };

    // Perform the database transaction
    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: stageId },
      });

      if (!session || session.capacity <= 0) {
        throw new Error("La session est complète ou introuvable.");
      }

      // Decrement session capacity
      await tx.session.update({
        where: { id: stageId },
        data: { capacity: { decrement: 1 } },
      });

      // Upsert user
      const user = await tx.user.upsert({
        where: { email: formattedUserData.email },
        update: formattedUserData,
        create: formattedUserData,
      });

      // Upsert session registration
      await tx.sessionUsers.upsert({
        where: {
          sessionId_userId: {
            sessionId: stageId,
            userId: user.id,
          },
        },
        update: {},
        create: {
          sessionId: stageId,
          userId: user.id,
          ...formattedDrivingLicenseData,
        },
      });
    });

    // Send confirmation email
    const emailSent = await sendEmail(
      formattedUserData.email,
      "Confirmation d'inscription",
      `Bonjour ${formattedUserData.prenom},\n\nVotre inscription au stage est confirmée.`,
      `<p>Bonjour ${formattedUserData.prenom},</p><p>Votre inscription au stage est confirmée.</p>`
    );

    if (!emailSent) {
      console.error("Échec de l'envoi de l'email.");
    }

    return NextResponse.json({ status: 200 });
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json(
      { message: error.message || "Une erreur est survenue lors de l'inscription." },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
