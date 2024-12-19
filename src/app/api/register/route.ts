import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure this import is properly configured

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      civilite,
      nom,
      prenom,
      prenom1,
      prenom2,
      adresse,
      codePostal,
      ville,
      dateNaissance,
      codePostalNaissance,
      nationalite,
      telephone,
      email,
      numeroPermis,
      dateDelivrancePermis,
      prefecture,
      etatPermis,
      casStage,
      stageId,
    } = body;

    // Ensure required fields are provided
    if (!email || !stageId) {
      return NextResponse.json(
        { success: false, error: "Email and StageId are required" },
        { status: 400 }
      );
    }

    // Upsert user data
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
        dateNaissance: new Date(dateNaissance),
        codePostalNaissance,
        nationalite,
        telephone,
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
        dateNaissance: new Date(dateNaissance),
        codePostalNaissance,
        nationalite,
        telephone,
        email,
      },
    });

    // Check if the session-user link already exists
    const existingLink = await prisma.sessionUsers.findFirst({
      where: { sessionId: stageId, userId: user.id },
    });

    if (!existingLink) {
      // Create new session-user link
      await prisma.sessionUsers.create({
        data: {
          sessionId: stageId,
          userId: user.id,
          numeroPermis,
          dateDelivrancePermis: new Date(dateDelivrancePermis),
          prefecture,
          etatPermis,
          casStage,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Registration successful" });
  } catch (error: any) {
    console.error("Error in registration:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
