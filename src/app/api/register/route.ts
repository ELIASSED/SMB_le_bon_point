// /app/api/register/route.ts (ou le chemin de votre endpoint)
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Récupérer et valider les données du corps de la requête
    const body = await request.json();
    const { userData, stageId } = body;

    if (!userData || !stageId) {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 }
      );
    }

    // Vérifier l'existence de la session (stage) et la disponibilité des places
    const session = await prisma.session.findUnique({
      where: { id: stageId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "La session n'existe pas." },
        { status: 404 }
      );
    }

    if (session.capacity <= 0) {
      return NextResponse.json(
        { error: "Plus de places disponibles." },
        { status: 400 }
      );
    }

    // Créer ou mettre à jour l'utilisateur via upsert
    const user = await prisma.user.upsert({
      where: { email: userData.email },
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
        email: userData.email,
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

    // Utiliser une transaction pour créer l'inscription et décrémenter la capacité de façon atomique
    const sessionUser = await prisma.$transaction(async (tx) => {
      // Vérifier si l'utilisateur est déjà inscrit à la session
      const existingSessionUser = await tx.sessionUsers.findUnique({
        where: {
          sessionId_userId: {
            sessionId: stageId,
            userId: user.id,
          },
        },
      });

      if (existingSessionUser) {
        throw new Error("L'utilisateur est déjà inscrit à cette session.");
      }

      // Créer l'inscription dans SessionUsers
      const newSessionUser = await tx.sessionUsers.create({
        data: {
          sessionId: stageId,
          userId: user.id,
        },
      });

      // Décrémenter la capacité de la session
      await tx.session.update({
        where: { id: stageId },
        data: { capacity: { decrement: 1 } },
      });

      return newSessionUser;
    });

    return NextResponse.json({
      message: "Utilisateur inscrit avec succès.",
      user,
      sessionUser,
    });
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error.message);
    if (error.message === "L'utilisateur est déjà inscrit à cette session.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
