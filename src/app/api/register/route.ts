import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userData, stageId } = body;

    console.log("Données reçues :", { userData, stageId });

    if (!userData || !stageId) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    // Vérifier si la session existe
    const session = await prisma.session.findUnique({
      where: { id: stageId },
    });
    if (!session) {
      return NextResponse.json({ error: "La session n'existe pas." }, { status: 404 });
    }
    if (session.capacity <= 0) {
      return NextResponse.json({ error: "Plus de places disponibles." }, { status: 400 });
    }

    // Normaliser l'email
    const normalizedEmail = userData.email.toLowerCase().trim();

    // Créer ou mettre à jour l'utilisateur
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        civilite: userData.civilite,
        nom: userData.nom,
        prenom: userData.prenom,
        adresse: userData.adresse,
        codePostal: userData.codePostal,
        ville: userData.ville,
        telephone: userData.telephone,
        nationalite: userData.nationalite,
        dateNaissance: new Date(userData.dateNaissance),
        codePostalNaissance: userData.codePostalNaissance,
        numeroPermis: userData.numeroPermis,
        dateDelivrancePermis: new Date(userData.dateDelivrancePermis),
        prefecture: userData.prefecture,
        etatPermis: userData.etatPermis,
        casStage: userData.casStage,
      },
      create: {
        civilite: userData.civilite,
        nom: userData.nom,
        prenom: userData.prenom,
        adresse: userData.adresse,
        codePostal: userData.codePostal,
        ville: userData.ville,
        telephone: userData.telephone,
        email: normalizedEmail,
        nationalite: userData.nationalite,
        dateNaissance: new Date(userData.dateNaissance),
        codePostalNaissance: userData.codePostalNaissance,
        numeroPermis: userData.numeroPermis,
        dateDelivrancePermis: new Date(userData.dateDelivrancePermis),
        prefecture: userData.prefecture,
        etatPermis: userData.etatPermis,
        casStage: userData.casStage,
      },
    });

    // Transaction pour vérifier et créer l'inscription
    const sessionUser = await prisma.$transaction(async (tx) => {
      // Vérification par email et date
      const existingByDate = await tx.sessionUsers.findFirst({
        where: {
          user: { email: normalizedEmail },
          session: { startDate: session.startDate },
        },
        include: { session: true },
      });

      if (existingByDate) {
        console.log("Inscription existante par date :", existingByDate);
        return NextResponse.json(
          {
            error: `Cet email (${normalizedEmail}) est déjà inscrit à une session débutant le ${session.startDate.toLocaleDateString("fr-FR")}.`,
          },
          { status: 400 }
        );
      }

      // Vérification par sessionId et userId (contrainte unique)
      const existingBySessionId = await tx.sessionUsers.findUnique({
        where: {
          sessionId_userId: { sessionId: stageId, userId: user.id },
        },
      });

      if (existingBySessionId) {
        console.log("Inscription existante par sessionId :", existingBySessionId);
        return NextResponse.json(
          { error: "Cet utilisateur est déjà inscrit à cette session." },
          { status: 400 }
        );
      }

      // Créer l'inscription
      const newSessionUser = await tx.sessionUsers.create({
        data: {
          sessionId: stageId,
          userId: user.id,
          isPaid: false,
        },
      });

      return newSessionUser;
    });

    if (sessionUser instanceof NextResponse) {
      return sessionUser;
    }

    return NextResponse.json({
      message: "Utilisateur inscrit avec succès.",
      user,
      sessionUser,
    });
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error.message);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
