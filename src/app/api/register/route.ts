import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Récupérer les données du corps de la requête
    const body = await request.json();
    const { userData, stageId } = body;

    // Validation des données
    if (!userData || !stageId) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    // Vérifier si la session existe et a des places disponibles
    const session = await prisma.session.findUnique({
      where: { id: stageId },
    });

    if (!session) {
      return NextResponse.json({ error: "La session n'existe pas." }, { status: 404 });
    }

    if (session.capacity <= 0) {
      return NextResponse.json({ error: "Plus de places disponibles." }, { status: 400 });
    }

    // Créer ou mettre à jour l'utilisateur
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

    // Vérifier si l'utilisateur est déjà inscrit à cette session
    const existingSessionUser = await prisma.sessionUsers.findUnique({
      where: {
        sessionId_userId: {
          sessionId: stageId,
          userId: user.id,
        },
      },
    });

    if (existingSessionUser) {
      return NextResponse.json({ error: "L'utilisateur est déjà inscrit à cette session." }, { status: 400 });
    }

    // Créer l'entrée dans SessionUsers
    const sessionUser = await prisma.sessionUsers.create({
      data: {
        sessionId: stageId,
        userId: user.id,
      },
    });

    // Réduire la capacité de la session
    await prisma.session.update({
      where: { id: stageId },
      data: { capacity: { decrement: 1 } },
    });

    return NextResponse.json({
      message: "Utilisateur inscrit avec succès.",
      user,
      sessionUser,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
