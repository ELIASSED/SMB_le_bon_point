import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stageId, userData, drivingLicenseData } = body;

    // Validate required fields
    if (!stageId || !userData || !drivingLicenseData) {
      throw new Error("Les champs 'stageId', 'userData', et 'drivingLicenseData' sont requis.");
    }

    // Format user and driving license data
    const formattedUserData = {
      ...userData,
      dateNaissance: userData.dateNaissance ? new Date(userData.dateNaissance) : null,
    };

    const formattedDrivingLicenseData = {
      ...drivingLicenseData,
      dateDelivrancePermis: drivingLicenseData.dateDelivrancePermis
        ? new Date(drivingLicenseData.dateDelivrancePermis)
        : null,
    };

    await prisma.$transaction(async (tx) => {
      // Check session availability
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

      // Link user to session with upsert
      await tx.sessionUsers.upsert({
        where: {
          sessionId_userId: {
            sessionId: stageId,
            userId: user.id,
          },
        },
        update: {
          ...formattedDrivingLicenseData, // Mise à jour si l'entrée existe
        },
        create: {
          sessionId: stageId,
          userId: user.id,
          ...formattedDrivingLicenseData, // Création si l'entrée n'existe pas
        },
      });
    });

    // Send confirmation email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-mail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userData.email,
        subject: "Confirmation d'inscription",
        text: `Bonjour ${userData.prenom},\n\nVotre inscription au stage ${stageId} est confirmée.`,
        html: `<p>Bonjour ${userData.prenom},</p><p>Votre inscription au stage ${stageId} est confirmée.</p>`,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Erreur lors de l'envoi de l'email :", await emailResponse.text());
      throw new Error("L'envoi de l'email a échoué.");
    }

    return NextResponse.json({ message: "Inscription réussie." });
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}
