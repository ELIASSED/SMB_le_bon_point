import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stageId, userData, drivingLicenseData } = body;

    // Supprimer le champ confirmationEmail
    const { confirmationEmail, ...cleanUserData } = userData;

    const formattedUserData = {
      ...cleanUserData,
      dateNaissance: new Date(cleanUserData.dateNaissance),
    };

    const formattedDrivingLicenseData = {
      ...drivingLicenseData,
      dateDelivrancePermis: new Date(drivingLicenseData.dateDelivrancePermis),
    };

    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: stageId },
      });

      if (!session || session.capacity <= 0) {
        throw new Error("La session est complète ou introuvable.");
      }

      // Décrémenter la capacité de la session
      await tx.session.update({
        where: { id: stageId },
        data: { capacity: { decrement: 1 } },
      });

      // Créer ou mettre à jour l'utilisateur
      const user = await tx.user.upsert({
        where: { email: formattedUserData.email },
        update: formattedUserData,
        create: formattedUserData,
      });

      // Vérifier ou créer l'inscription dans sessionUsers
      await tx.sessionUsers.upsert({
        where: {
          sessionId_userId: {
            sessionId: stageId,
            userId: user.id,
          },
        },
        update: {}, // Ne rien mettre à jour si l'entrée existe
        create: {
          sessionId: stageId,
          userId: user.id,
          ...formattedDrivingLicenseData,
        },
      });
    });

    return NextResponse.json({ message: "Inscription réussie" }, { status: 200 });
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


