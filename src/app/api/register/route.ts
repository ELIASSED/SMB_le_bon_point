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

  console.log("Valeurs brutes avant normalisation:", {
    infractionDate,
    judgmentDate,
    infractionTime,
    infractionPlace,
    parquetNumber,
  });

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

  console.log("Valeurs après normalisation:", {
    infractionDate: normalizedData.infractionDate,
    judgmentDate: normalizedData.judgmentDate,
    infractionTime: normalizedData.infractionTime,
    infractionPlace: normalizedData.infractionPlace,
    parquetNumber: normalizedData.parquetNumber,
  });

  return normalizedData;
};

export async function POST(req: NextRequest) {
  try {
    // Étape 1 : Parser la requête
    const body = await req.json();
    console.log("Requête reçue à /api/register:", JSON.stringify(body, null, 2));

    const { stageId, userData }: { stageId: number; userData: RegistrationInfo } = body;

    // Étape 2 : Validation initiale
    if (!stageId || !userData) {
      console.error("Données manquantes:", { stageId, userData });
      return NextResponse.json(
        { error: "Stage ID ou données utilisateur manquantes", code: "MISSING_DATA" },
        { status: 400 }
      );
    }

    // Étape 3 : Validation des champs obligatoires
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !userData[field] || userData[field]?.trim() === ""
    );
    if (missingFields.length > 0) {
      console.error("Champs obligatoires manquants:", missingFields);
      return NextResponse.json(
        { error: `Champs obligatoires manquants : ${missingFields.join(", ")}`, code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    // Étape 4 : Validation spécifique pour Cas 3
    if (userData.casStage === "3") {
      const missingCase3Fields = CASE_3_REQUIRED_FIELDS.filter(
        (field) => !userData[field] || userData[field]?.trim() === ""
      );
      if (missingCase3Fields.length > 0) {
        console.error("Champs obligatoires pour Cas 3 manquants:", missingCase3Fields);
        return NextResponse.json(
          { error: `Champs obligatoires pour Cas 3 manquants : ${missingCase3Fields.join(", ")}`, code: "MISSING_CASE_3_FIELDS" },
          { status: 400 }
        );
      }
    }

    // Étape 5 : Validation des formats
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
        { error: "Format de date de délivrance du permis invalide (YYYY-MM-DD requis)", code: "INVALID_DATE" },
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

    // Étape 6 : Normalisation des données
    const normalizedUserData = normalizeUserData(userData);
    console.log(
      "Données utilisateur normalisées:",
      JSON.stringify(normalizedUserData, null, 2)
    );

    // Étape 7 : Vérifier l'unicité de l'email pour la session
    const existingSessionUser = await prisma.sessionUsers.findFirst({
      where: {
        sessionId: stageId,
        user: {
          email: normalizedUserData.email,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingSessionUser) {
      console.error("L'email est déjà associé à cette session:", {
        email: normalizedUserData.email,
        sessionId: stageId,
      });
      return NextResponse.json(
        { error: "Cet email est déjà inscrit pour cette session", code: "EMAIL_ALREADY_IN_SESSION" },
        { status: 400 }
      );
    }

    // Étape 8 : Trouver ou créer l'utilisateur
    let user = await prisma.user.findFirst({
      where: {
        email: normalizedUserData.email,
      },
    });

    if (!user) {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          ...normalizedUserData,
        },
      });
      console.log("Nouvel utilisateur créé:", { id: user.id, email: user.email });
    } else {
      // Mettre à jour l'utilisateur existant
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...normalizedUserData,
        },
      });
      console.log("Utilisateur mis à jour:", { id: user.id, email: user.email });
    }

    // Étape 9 : Créer l'enregistrement SessionUsers
    const sessionUser = await prisma.sessionUsers.create({
      data: {
        userId: user.id,
        sessionId: stageId,
        isPaid: false,
      },
    });

    console.log("Utilisateur associé à la session:", {
      userId: user.id,
      sessionId: stageId,
      sessionUserId: sessionUser.id,
    });

    // Étape 10 : Retourner la réponse
    console.log("Utilisateur créé ou mis à jour:", {
      id: user.id,
      email: user.email,
      casStage: user.casStage,
      infractionDate: user.infractionDate,
      infractionTime: user.infractionTime,
      infractionPlace: user.infractionPlace,
      parquetNumber: user.parquetNumber,
      judgmentDate: user.judgmentDate,
      documentUrls: {
        id_recto: user.id_recto,
        id_verso: user.id_verso,
        permis_recto: user.permis_recto,
        permis_verso: user.permis_verso,
        letter_48N: user.letter_48N,
        extraDocument: user.extraDocument,
      },
    });

    return NextResponse.json({ user, sessionUser }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur dans /api/register:", {
      message: error.message,
      stack: error.stack,
      body: JSON.stringify(await req.json().catch(() => ({})), null, 2),
    });
    return NextResponse.json(
      { error: error.message || "Erreur serveur lors de l'inscription", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}