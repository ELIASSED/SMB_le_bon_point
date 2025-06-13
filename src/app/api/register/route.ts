import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegistrationInfo } from "@/components/Carousel/types";

// Champs obligatoires basés sur le schéma Prisma
const REQUIRED_FIELDS = [
  "civilite",
  "nom",
  "prenom",
  "email",
  "adresse",
  "codePostal",
  "ville",
  "telephone",
  "nationalite",
  "dateNaissance",
  "codePostalNaissance",
  "numeroPermis",
  "dateDelivrancePermis",
  "prefecture",
  "etatPermis",
  "casStage",
] as const;

// Champs requis pour Cas 3
const CASE_3_REQUIRED_FIELDS = ["parquetNumber", "judgmentDate"] as const;

// Utilitaire pour valider le format de date (YYYY-MM-DD)
const isValidDate = (dateStr: string): boolean => {
  if (!dateStr || dateStr.trim() === "") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && dateStr === date.toISOString().split("T")[0];
};

// Utilitaire pour valider le format de l'heure (HH:mm)
const isValidTime = (timeStr: string): boolean => {
  if (!timeStr || timeStr.trim() === "") return false;
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeStr);
};

// Normalisation des données utilisateur
const normalizeUserData = (userData: RegistrationInfo) => {
  // Gérer les chaînes vides pour les champs optionnels
  const infractionDate = userData.infractionDate?.trim();
  const judgmentDate = userData.judgmentDate?.trim();
  const infractionTime = userData.infractionTime?.trim();
  const infractionPlace = userData.infractionPlace?.trim();
  const parquetNumber = userData.parquetNumber?.trim();

  const normalizedData = {
    civilite: userData.civilite!.trim(),
    nom: userData.nom!.trim(),
    prenom: userData.prenom!.trim(),
    prenom1: userData.prenom1?.trim() || null,
    prenom2: userData.prenom2?.trim() || null,
    adresse: userData.adresse!.trim(),
    codePostal: userData.codePostal!.trim(),
    ville: userData.ville!.trim(),
    telephone: userData.telephone!.trim(),
    email: userData.email!.toLowerCase().trim(),
    nationalite: userData.nationalite!.trim(),
    dateNaissance: new Date(userData.dateNaissance!),
    codePostalNaissance: userData.codePostalNaissance!.trim(),
    numeroPermis: userData.numeroPermis!.trim(),
    dateDelivrancePermis: new Date(userData.dateDelivrancePermis!),
    prefecture: userData.prefecture!.trim(),
    etatPermis: userData.etatPermis!.trim(),
    casStage: userData.casStage!.trim(),
    id_recto: userData.id_recto?.trim() || null,
    id_verso: userData.id_verso?.trim() || null,
    permis_recto: userData.permis_recto?.trim() || null,
    permis_verso: userData.permis_verso?.trim() || null,
    letter_48N: userData.letter_48N?.trim() || null,
    extraDocument: userData.extraDocument?.trim() || null,
    infractionDate: infractionDate && isValidDate(infractionDate) ? new Date(infractionDate) : null,
    infractionTime: infractionTime && isValidTime(infractionTime) ? infractionTime : null,
    infractionPlace: infractionPlace || null,
    parquetNumber: parquetNumber || null,
    judgmentDate: judgmentDate && isValidDate(judgmentDate) ? new Date(judgmentDate) : null,
  };

  return normalizedData;
};


export async function POST(req: NextRequest) {
  try {
    // Étape 1 : Parser la requête
    const body = await req.json();
    const { stageId, userData, userId, sessionUserId }: { stageId: number; userData: RegistrationInfo; userId?: string; sessionUserId?: string } = body;

    // Étape 2 : Validation initiale
    if (!stageId || !userData) {
      console.error("Données manquantes:", { stageId, userData });
      return NextResponse.json(
        { error: "Stage ID ou données utilisateur manquantes", code: "MISSING_DATA" },
        { status: 400 }
      );
    }

    // Valider que stageId est un nombre valide
    if (isNaN(stageId) || stageId <= 0) {
      console.error("Stage ID invalide:", stageId);
      return NextResponse.json(
        { error: "Stage ID invalide", code: "INVALID_STAGE_ID" },
        { status: 400 }
      );
    }

    // Étape 3 : Vérifier l'existence du stage
    const stageExists = await prisma.session.findUnique({
      where: { id: stageId },
    });
    if (!stageExists) {
      console.error("Stage introuvable:", stageId);
      return NextResponse.json(
        { error: "Stage introuvable", code: "STAGE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Étape 4 : Validation des champs obligatoires
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !userData[field] || userData[field]?.trim() === ""
    );
    if (missingFields.length > 0) {
      console.error("Champs obligatoires manquants:", missingFields);
      return NextResponse.json(
        {
          error: `Champs obligatoires manquants : ${missingFields.join(", ")}`,
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    // Étape 5 : Validation spécifique pour Cas 3
    if (userData.casStage === "3") {
      const missingCase3Fields = CASE_3_REQUIRED_FIELDS.filter(
        (field) => !userData[field] || userData[field]?.trim() === ""
      );
      if (missingCase3Fields.length > 0) {
        console.error("Champs obligatoires pour Cas 3 manquants:", missingCase3Fields);
        return NextResponse.json(
          {
            error: `Champs obligatoires pour Cas 3 manquants : ${missingCase3Fields.join(", ")}`,
            code: "MISSING_CASE_3_FIELDS",
          },
          { status: 400 }
        );
      }
    }

    // Étape 6 : Validation des formats
    // Dates obligatoires
    if (!isValidDate(userData.dateNaissance)) {
      console.error("Format de dateNaissance invalide:", userData.dateNaissance);
      return NextResponse.json(
        { error: "Format de date de naissance invalide (YYYY-MM-DD requis)", code: "INVALID_DATE" },
        { status: 400 }
      );
    }
    if (!isValidDate(userData.dateDelivrancePermis)) {
      console.error("Format de dateDelivrancePermis invalide:", userData.dateDelivrancePermis);
      return NextResponse.json(
        {
          error: "Format de date de délivrance du permis invalide (YYYY-MM-DD requis)",
          code: "INVALID_DATE",
        },
        { status: 400 }
      );
    }

    // Dates et heure optionnelles
    if (userData.infractionDate && !isValidDate(userData.infractionDate)) {
      console.error("Format de infractionDate invalide:", userData.infractionDate);
      return NextResponse.json(
        { error: "Format de date d'infraction invalide (YYYY-MM-DD requis)", code: "INVALID_DATE" },
        { status: 400 }
      );
    }
    if (userData.judgmentDate && !isValidDate(userData.judgmentDate)) {
      console.error("Format de judgmentDate invalide:", userData.judgmentDate);
      return NextResponse.json(
        { error: "Format de date de jugement invalide (YYYY-MM-DD requis)", code: "INVALID_DATE" },
        { status: 400 }
      );
    }
    if (userData.infractionTime && !isValidTime(userData.infractionTime)) {
      console.error("Format de infractionTime invalide:", userData.infractionTime);
      return NextResponse.json(
        { error: "Format de l'heure d'infraction invalide (HH:mm requis)", code: "INVALID_TIME" },
        { status: 400 }
      );
    }

    // Étape 7 : Normalisation des données
    const normalizedUserData = normalizeUserData(userData);

    // Étape 8 : Gérer l'utilisateur
    let user;
    if (userId) {
      // Valider et convertir userId
      const parsedUserId = parseInt(userId, 10);
      if (isNaN(parsedUserId)) {
        console.error("User ID invalide:", userId);
        return NextResponse.json(
          { error: "User ID invalide", code: "INVALID_USER_ID" },
          { status: 400 }
        );
      }

      // Mettre à jour l'utilisateur existant
      try {
        user = await prisma.user.update({
          where: { id: parsedUserId },
          data: normalizedUserData,
        });
        console.log("Utilisateur mis à jour:", { id: user.id, email: user.email });
      } catch (error: any) {
        if (error.code === "P2025") {
          console.error("Utilisateur introuvable:", parsedUserId);
          return NextResponse.json(
            { error: "Utilisateur introuvable", code: "USER_NOT_FOUND" },
            { status: 404 }
          );
        }
        throw error; // Rethrow other errors
      }
    } else {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: normalizedUserData,
      });
      console.log("Nouvel utilisateur créé:", { id: user.id, email: user.email });
    }

    // Étape 9 : Gérer l'enregistrement SessionUsers
    let sessionUser;
    if (sessionUserId) {
      // Valider et convertir sessionUserId
      const parsedSessionUserId = parseInt(sessionUserId, 10);
      if (isNaN(parsedSessionUserId)) {
        console.error("SessionUser ID invalide:", sessionUserId);
        return NextResponse.json(
          { error: "SessionUser ID invalide", code: "INVALID_SESSION_USER_ID" },
          { status: 400 }
        );
      }

      // Supprimer l'ancien enregistrement sessionUsers
      try {
        await prisma.sessionUsers.delete({
          where: { id: parsedSessionUserId },
        });
        console.log("Ancien sessionUsers supprimé:", { sessionUserId: parsedSessionUserId });
      } catch (error: any) {
        if (error.code === "P2025") {
          console.warn("SessionUsers introuvable, ignoré:", parsedSessionUserId);
        } else {
          throw error; // Rethrow other errors
        }
      }
    }

    // Créer un nouvel enregistrement sessionUsers
    sessionUser = await prisma.sessionUsers.create({
      data: {
        userId: user.id,
        sessionId: stageId,
        isPaid: false,
      },
    });
    console.log("Nouveau sessionUsers créé:", { id: sessionUser.id, userId: user.id, sessionId: stageId });

    return NextResponse.json({ user, sessionUser }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur dans /api/register:", {
      message: error.message,
      stack: error.stack,
      body: await req.json().catch(() => ({})),
    });
    return NextResponse.json(
      { error: error.message || "Erreur serveur lors de l'inscription", code: "SERVER_ERROR" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client is disconnected
  }
}