import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../lib/mailer"; // Import direct pour utiliser la logique de mailer
import { generateConfirmationEmail } from "../../../lib/emailTemplates"; // Pour le template

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stageId, userData, drivingLicenseData } = body;

    if (!stageId || !userData || !drivingLicenseData) {
      throw new Error(
        "Les champs 'stageId', 'userData', et 'drivingLicenseData' sont requis."
      );
    }

    // Formatage des données
    const formattedUserData = {
      ...userData,
      dateNaissance: userData.dateNaissance
        ? new Date(userData.dateNaissance)
        : null,
    };

    const formattedDrivingLicenseData = {
      ...drivingLicenseData,
      dateDelivrancePermis: drivingLicenseData.dateDelivrancePermis
        ? new Date(drivingLicenseData.dateDelivrancePermis)
        : null,
    };

    // Transaction : créer user, inscrire et décrémenter la capacité
    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: stageId },
      });

      if (!session || session.capacity <= 0) {
        throw new Error("La session est complète ou introuvable.");
      }

      await tx.session.update({
        where: { id: stageId },
        data: { capacity: { decrement: 1 } },
      });

      const user = await tx.user.upsert({
        where: { email: formattedUserData.email },
        update: formattedUserData,
        create: formattedUserData,
      });

      await tx.sessionUsers.upsert({
        where: {
          sessionId_userId: {
            sessionId: stageId,
            userId: user.id,
          },
        },
        update: {
          ...formattedDrivingLicenseData,
        },
        create: {
          sessionId: stageId,
          userId: user.id,
          ...formattedDrivingLicenseData,
        },
      });

      // Génération et envoi d'email après transaction
      const emailHtml = generateConfirmationEmail(
        userData.prenom,
        userData.nom,
        session.location,
        session.numeroStageAnts,
        session.startDate.toISOString(),
        session.endDate.toISOString()
      );

      await sendEmail(
        userData.email,
        "Confirmation d'inscription",
        `Bonjour ${userData.prenom}, votre inscription au stage ${stageId} est confirmée.`,
        emailHtml
      );
    });

    return NextResponse.json({ message: "Inscription réussie." });
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}
