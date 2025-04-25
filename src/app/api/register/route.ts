
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegistrationInfo } from "@/components/Carousel/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Requête reçue à /api/register:", JSON.stringify(body, null, 2));

    const { stageId, userData }: { stageId: number; userData: RegistrationInfo } = body;

    if (!stageId || !userData) {
      console.error("Données manquantes dans la requête:", { stageId, userData });
      return NextResponse.json({ error: "Stage ID ou données utilisateur manquantes" }, { status: 400 });
    }

    const normalizedUserData = {
      civilite: userData.civilite || null,
      nom: userData.nom || null,
      prenom: userData.prenom || null,
      prenom1: userData.prenom1 || null,
      prenom2: userData.prenom2 || null,
      adresse: userData.adresse || null,
      codePostal: userData.codePostal || null,
      ville: userData.ville || null,
      telephone: userData.telephone || null,
      email: userData.email?.toLowerCase().trim() || null,
      nationalite: userData.nationalite || null,
      dateNaissance: userData.dateNaissance ? new Date(userData.dateNaissance) : null,
      codePostalNaissance: userData.codePostalNaissance || null,
      numeroPermis: userData.numeroPermis || null,
      dateDelivrancePermis: userData.dateDelivrancePermis ? new Date(userData.dateDelivrancePermis) : null,
      prefecture: userData.prefecture || null,
      etatPermis: userData.etatPermis || null,
      casStage: userData.casStage || null,
      permis_recto: userData.permis_recto || null,
      permis_verso: userData.permis_verso || null,
      id_recto: userData.id_recto || null,
      id_verso: userData.id_verso || null,
      letter_48N: userData.letter_48N || null,
      extraDocument: userData.extraDocument || null,
    };

    console.log("Données utilisateur normalisées:", JSON.stringify(normalizedUserData, null, 2));
    console.log("URLs des documents:", {
      permis_recto: normalizedUserData.permis_recto,
      permis_verso: normalizedUserData.permis_verso,
      id_recto: normalizedUserData.id_recto,
      id_verso: normalizedUserData.id_verso,
      letter_48N: normalizedUserData.letter_48N,
      extraDocument: normalizedUserData.extraDocument,
    });

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
      { error: error.message || "Erreur lors de l'enregistrement de l'utilisateur" },
      { status: 500 }
    );
  }
}