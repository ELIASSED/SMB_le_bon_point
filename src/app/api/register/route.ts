import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { stageId, userData } = await request.json();
    console.log("Requête reçue dans /api/register :", { stageId, userData });

    if (!userData || !stageId) {
      console.log("Données invalides détectées.");
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    // Liste des champs obligatoires
    const requiredFields = [
      "civilite",
      "nom",
      "prenom",
      "adresse",
      "codePostal",
      "ville",
      "telephone",
      "email",
      "nationalite",
      "dateNaissance",
      "codePostalNaissance",
      "numeroPermis",
      "dateDelivrancePermis",
      "prefecture",
      "etatPermis",
      "casStage",
    ];

    const missingFields = requiredFields.filter((field) => !userData[field]);
    if (missingFields.length > 0) {
      console.log("Champs manquants :", missingFields);
      return NextResponse.json(
        { error: `Champs manquants: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Vérifier si un utilisateur avec cet email est déjà associé à la session (stageId)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: userData.email,
        sessionUsers: {
          some: {
            sessionId: stageId, // adapte selon le nom de ton champ de liaison
          },
        },
      },
    });

    if (existingUser) {
      console.log("Cet email est déjà utilisé pour cette session :", existingUser);
      return NextResponse.json(
        { error: "Cet email est déjà utilisé pour cette session." },
        { status: 409 }
      );
    }

    // On retire le champ confirmationEmail qui n'est pas défini dans le schéma Prisma
    const { confirmationEmail, ...filteredUserData } = userData;

    // Conversion des dates si nécessaire
    filteredUserData.dateNaissance = new Date(filteredUserData.dateNaissance);
    filteredUserData.dateDelivrancePermis = new Date(filteredUserData.dateDelivrancePermis);

    // Créer le nouvel utilisateur et l'associer à la session
    const newUser = await prisma.user.create({
      data: {
        ...filteredUserData,
        sessionUsers: {
          create: { sessionId: stageId },
        },
      },
    });

    console.log("Utilisateur créé avec succès :", newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Erreur dans /api/register :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
