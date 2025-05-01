import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegistrationInfo } from "@/components/Carousel/types";

// Define required fields based on your Prisma schema
const REQUIRED_FIELDS = [
  "civilite", 
  "nom", 
  "prenom", 
  "email",
  "adresse",          // Add these as required
  "codePostal",       // Add these as required
  "ville",            // Add these as required
  "telephone",        // Add these as required
  "nationalite",      // Add these as required
  "dateNaissance",    // Add these as required
  "codePostalNaissance", // Add these as required
  "numeroPermis",     // Add these as required
  "dateDelivrancePermis", // Add these as required
  "prefecture",       // Add these as required
  "etatPermis",       // Add these as required
  "casStage"          // Add these as required
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Requête reçue à /api/register:", JSON.stringify(body, null, 2));

    const { stageId, userData }: { stageId: number; userData: RegistrationInfo } = body;

    // Validate input
    if (!stageId || !userData) {
      console.error("Données manquantes dans la requête:", { stageId, userData });
      return NextResponse.json(
        { error: "Stage ID ou données utilisateur manquantes" },
        { status: 400 }
      );
    }

    // Validate required fields
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !userData[field] || userData[field]?.trim() === ""
    );
    if (missingFields.length > 0) {
      console.error("Champs obligatoires manquants:", missingFields);
      return NextResponse.json(
        { error: `Les champs suivants sont obligatoires : ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Handle date fields properly
    if (!userData.dateNaissance) {
      return NextResponse.json(
        { error: "La date de naissance est obligatoire" },
        { status: 400 }
      );
    }

    if (!userData.dateDelivrancePermis) {
      return NextResponse.json(
        { error: "La date de délivrance du permis est obligatoire" },
        { status: 400 }
      );
    }

    // Normalize user data with type safety - ensuring required fields aren't null
    const normalizedUserData = {
      civilite: userData.civilite!,
      nom: userData.nom!,
      prenom: userData.prenom!,
      prenom1: userData.prenom1?.trim() || null,
      prenom2: userData.prenom2?.trim() || null,
      adresse: userData.adresse!.trim(),  // Now required
      codePostal: userData.codePostal!.trim(), // Now required
      ville: userData.ville!.trim(), // Now required
      telephone: userData.telephone!.trim(), // Now required
      email: userData.email!.toLowerCase().trim(),
      nationalite: userData.nationalite!.trim(), // Now required
      dateNaissance: new Date(userData.dateNaissance!), // Now required
      codePostalNaissance: userData.codePostalNaissance!.trim(), // Now required
      numeroPermis: userData.numeroPermis!.trim(), // Now required
      dateDelivrancePermis: new Date(userData.dateDelivrancePermis!), // Now required
      prefecture: userData.prefecture!.trim(), // Now required
      etatPermis: userData.etatPermis!.trim(), // Now required
      casStage: userData.casStage!.trim(), // Now required
      permis_recto: userData.permis_recto?.trim() || null,
      permis_verso: userData.permis_verso?.trim() || null,
      id_recto: userData.id_recto?.trim() || null,
      id_verso: userData.id_verso?.trim() || null,
      letter_48N: userData.letter_48N?.trim() || null,
      extraDocument: userData.extraDocument?.trim() || null,
    };

    console.log(
      "Données utilisateur normalisées:",
      JSON.stringify(normalizedUserData, null, 2)
    );
    console.log("URLs des documents:", {
      permis_recto: normalizedUserData.permis_recto,
      permis_verso: normalizedUserData.permis_verso,
      id_recto: normalizedUserData.id_recto,
      id_verso: normalizedUserData.id_verso,
      letter_48N: normalizedUserData.letter_48N,
      extraDocument: normalizedUserData.extraDocument,
    });

    // Create user with Prisma
    const user = await prisma.user.create({
      data: {
        ...normalizedUserData,
        sessionUsers: {
          create: {
            sessionId: stageId,
            isPaid: false,
          },
        },
      },
    });

    console.log("Utilisateur créé:", {
      id: user.id,
      email: user.email,
      permis_recto: user.permis_recto,
      permis_verso: user.permis_verso,
      id_recto: user.id_recto,
      id_verso: user.id_verso,
      letter_48N: user.letter_48N,
      extraDocument: user.extraDocument,
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur dans /api/register:", error.message, error.stack);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}