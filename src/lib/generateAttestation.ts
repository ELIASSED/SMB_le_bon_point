// src/lib/generateAttestation.ts
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import chromium from "chrome-aws-lambda";
import { Browser } from "puppeteer-core";
import { SessionUsers, User, Session } from "@prisma/client";
import prisma from "@/lib/prisma";

// Charger le template HTML
const templatePath = path.join(process.cwd(), "src/lib/templates/attestation.html");
if (!fs.existsSync(templatePath)) {
  console.error(`❌ Fichier template introuvable à : ${templatePath}`);
  throw new Error(`Template HTML introuvable à : ${templatePath}`);
}
const templateHtml = fs.readFileSync(templatePath, "utf8");
const template = Handlebars.compile(templateHtml);

// Formater les dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const generateAttestation = async (
  sessionUser: SessionUsers & { user: User; session: Session }
): Promise<Buffer> => {
  const { user, session } = sessionUser;

  // Récupérer l'instructeur
  const instructor = await prisma.instructor.findUnique({
    where: { id: session.instructorId },
    select: { lastName: true, firstName: true },
  });

  if (!instructor) {
    console.warn(`⚠️ Animateur non trouvé pour instructorId: ${session.instructorId}`);
  }

  // Récupérer le psychologue (si applicable)
  const psychologue = session.psychologueId
    ? await prisma.psychologue.findUnique({
        where: { id: session.psychologueId },
        select: { lastName: true, firstName: true },
      })
    : null;

  if (session.psychologueId && !psychologue) {
    console.warn(`⚠️ Psychologue non trouvé pour psychologueId: ${session.psychologueId}`);
  }

  // Préparer les données pour le template
  const stagiaire = {
    nom: user.nom,
    prenom: user.prenom,
    adresse: user.adresse,
    ville: user.ville,
    dateNaissance: formatDate(user.dateNaissance),
    lieuNaissance: user.codePostalNaissance || "Non spécifié",
    numeroPermis: user.numeroPermis,
    datePermis: formatDate(user.dateDelivrancePermis),
    prefecturePermis: user.prefecture,
    dateDebutStage: formatDate(session.startDate),
    dateFinStage: formatDate(session.endDate),
    casStage: user.casStage,
    dateAttestation: formatDate(new Date()),
    animateur: instructor ? `${instructor.firstName} ${instructor.lastName}` : "Animateur non spécifié",
    psychologue: psychologue ? `${psychologue.firstName} ${psychologue.lastName}` : "Psychologue non spécifié",
  };

  const html = template(stagiaire);

  // Lancer Chromium avec chrome-aws-lambda
  let browser: Browser | null = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfData = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    const pdfBuffer = Buffer.from(pdfData);

    console.log(`✅ PDF généré en mémoire pour ${user.nom} ${user.prenom}`);
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Erreur lors de la génération du PDF :", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default generateAttestation;