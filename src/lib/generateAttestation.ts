import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { SessionUsers, User, Session, Instructor, Psychologue } from '@prisma/client';
import prisma from '@/lib/prisma';

const templatePath = path.join(process.cwd(), 'src/lib/templates/attestation.html');
if (!fs.existsSync(templatePath)) {
  console.error(`❌ Fichier template introuvable à : ${templatePath}`);
  throw new Error(`Template HTML introuvable à : ${templatePath}`);
}
const templateHtml = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(templateHtml);

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const generateAttestation = async (sessionUser: SessionUsers & { user: User; session: Session }): Promise<Buffer> => {
  const { user, session } = sessionUser;

  const instructor = await prisma.instructor.findUnique({
    where: { id: session.instructorId },
    select: { lastName: true, firstName: true },
  });

  if (!instructor) {
    console.warn(`⚠️ Animateur non trouvé pour instructorId: ${session.instructorId}`);
  }

  const psychologue = session.psychologueId
    ? await prisma.psychologue.findUnique({
        where: { id: session.psychologueId },
        select: { lastName: true, firstName: true },
      })
    : null;

  if (session.psychologueId && !psychologue) {
    console.warn(`⚠️ Psychologue non trouvé pour psychologueId: ${session.psychologueId}`);
  }

  const stagiaire = {
    nom: user.nom,
    prenom: user.prenom,
    adresse: user.adresse,
    ville: user.ville,
    dateNaissance: formatDate(user.dateNaissance),
    lieuNaissance: user.codePostalNaissance || 'Non spécifié',
    numeroPermis: user.numeroPermis,
    datePermis: formatDate(user.dateDelivrancePermis),
    prefecturePermis: user.prefecture,
    dateDebutStage: formatDate(session.startDate),
    dateFinStage: formatDate(session.endDate),
    casStage: user.casStage,
    dateAttestation: formatDate(new Date()),
    animateur: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Animateur non spécifié',
    psychologue: psychologue ? `${psychologue.firstName} ${psychologue.lastName}` : 'Psychologue non spécifié',
  };

  const html = template(stagiaire);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfData = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  const pdfBuffer = Buffer.from(pdfData);

  await browser.close();

  console.log(`✅ PDF généré en mémoire pour ${user.nom} ${user.prenom}`);
  return pdfBuffer;
};

export default generateAttestation;