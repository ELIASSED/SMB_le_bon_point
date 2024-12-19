import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      civilite,
      nom,
      prenom,
      prenom1,
      prenom2,
      adresse,
      codePostal,
      ville,
      telephone,
      email,
      nationalite,
      dateNaissance,
      codePostalNaissance,
      numeroPermis,
      dateDelivrancePermis,
      prefecture,
      etatPermis,
      casStage,
      stageId,
    } = await req.json();

    // Vérifier si l'utilisateur existe déjà
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        civilite,
        nom,
        prenom,
        prenom1,
        prenom2,
        adresse,
        codePostal,
        ville,
        telephone,
        nationalite,
        dateNaissance: new Date(dateNaissance),
        codePostalNaissance,
      },
      create: {
        civilite,
        nom,
        prenom,
        prenom1,
        prenom2,
        adresse,
        codePostal,
        ville,
        telephone,
        email,
        nationalite,
        dateNaissance: new Date(dateNaissance),
        codePostalNaissance,
      },
    });

    // Associer l'utilisateur à la session
    const sessionUser = await prisma.sessionUser.create({
      data: {
        sessionId: stageId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, user, sessionUser });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
