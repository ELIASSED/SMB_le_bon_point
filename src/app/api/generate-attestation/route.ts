import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import pdf from 'html-pdf';
import prisma from '@/lib/prisma';

// Types for the response
type ResponseData = {
  message: string;
  filePath?: string;
  error?: string;
};

// Load HTML template
const templatePath = path.join(process.cwd(), 'lib/templates/attestation.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(templateHtml);

// Date formatting function
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Ensure documents directory exists
const documentsDir = path.join(process.cwd(), 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionUserId } = body as { sessionUserId?: string };

    if (!sessionUserId) {
      return NextResponse.json({ message: 'ID de SessionUsers requis' }, { status: 400 });
    }

    // Fetch SessionUsers with relations
    const sessionUser = await prisma.sessionUsers.findUnique({
      where: { id: parseInt(sessionUserId) },
      include: {
        user: true,
        session: true,
        payments: true,
      },
    });

    if (!sessionUser) {
      return NextResponse.json({ message: 'SessionUsers non trouvé' }, { status: 404 });
    }

    // Check payment confirmation
    if (!sessionUser.isPaid || sessionUser.payments.length === 0) {
      return NextResponse.json({ message: 'Paiement non confirmé' }, { status: 403 });
    }

    const { user, session } = sessionUser;

    // Prepare data for template
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
    };

    const html = template(stagiaire);
    const options: pdf.CreateOptions = { format: 'A4' };
    const fileName = `attestation_${user.nom}_${user.prenom}_${sessionUserId}.pdf`;
    const filePath = path.join(documentsDir, fileName);

    // Generate PDF
    await new Promise((resolve, reject) => {
      pdf.create(html, options).toFile(filePath, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    return NextResponse.json({ message: 'PDF généré', filePath: filePath }, { status: 200 });
  } catch (error) {
    console.error('Erreur :', error);
    return NextResponse.json({ 
      message: 'Erreur serveur', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}