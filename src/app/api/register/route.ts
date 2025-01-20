import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../lib/mailer"; 
import { generateConfirmationEmail } from "../../../lib/emailTemplates";

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

    // 1. Merge / format user fields
    const formattedUserData = {
      ...userData,
      dateNaissance: userData.dateNaissance
        ? new Date(userData.dateNaissance)
        : null,
    };

    // 2. Merge / format driving license fields (these belong to the User model)
    const formattedDrivingLicenseData = {
      ...drivingLicenseData,
      dateDelivrancePermis: drivingLicenseData.dateDelivrancePermis
        ? new Date(drivingLicenseData.dateDelivrancePermis)
        : null,
    };

    // Combine both objects into one for the User
    const mergedUserData = {
      ...formattedUserData,
      ...formattedDrivingLicenseData,
    };

    await prisma.$transaction(async (tx) => {
      // 3. Fetch the session
      const session = await tx.session.findUnique({
        where: { id: stageId },
      });

      if (!session) {
        throw new Error("Session introuvable.");
      }

      // 4. Upsert the user with driving license fields on the User model
      const user = await tx.user.upsert({
        where: { email: mergedUserData.email },
        update: mergedUserData,
        create: mergedUserData,
      });

      // 5. Check if the user is already enrolled in the session
      const existingSessionUser = await tx.sessionUsers.findUnique({
        where: {
          sessionId_userId: {
            sessionId: stageId,
            userId: user.id,
          },
        },
      });

      // 6. If not enrolled, proceed with capacity decrement, enrollment, and email
      if (!existingSessionUser) {
        // Make sure the session isn't full
        if (session.capacity <= 0) {
          throw new Error("La session est complète.");
        }

        // Decrement session capacity by 1
        await tx.session.update({
          where: { id: stageId },
          data: { capacity: { decrement: 1 } },
        });

        // Enroll the user in SessionUsers
        await tx.sessionUsers.create({
          data: {
            sessionId: stageId,
            userId: user.id,
          },
        });

        // Generate and send a confirmation email
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
      } else {
        // If already enrolled, you can decide how to handle:
        // - throw error
        // - return a message 
        // - or handle re-enrollment differently
        throw new Error("Vous êtes déjà inscrit à cette session.");
      }
    });

    return NextResponse.json({ message: "Inscription réussie." });
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}
