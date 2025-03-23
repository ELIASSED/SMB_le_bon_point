import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import pdf from 'html-pdf';
import prisma from '@/lib/prisma';

// Types pour la réponse
type ResponseData = {
  message: string;
  filePath?: string;
  error?: string;
};

// Charger le template HTML
const templatePath = path.join(process.cwd(), 'lib/templates/attestation.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(templateHtml);

// Fonction pour formater les dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Créer le dossier "documents" s'il n'existe pas
const documentsDir = path.join(process.cwd(), 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { sessionUserId } = req.body as { sessionUserId?: string };

  if (!sessionUserId) {
    return res.status(400).json({ message: 'ID de SessionUsers requis' });
  }

  try {
    // Récupérer les données de SessionUsers avec relations
    const sessionUser = await prisma.sessionUsers.findUnique({
      where: { id: parseInt(sessionUserId) },
      include: {
        user: true,
        session: true,
        payments: true, // Inclure les paiements pour vérification
      },
    });

    if (!sessionUser) {
      return res.status(404).json({ message: 'SessionUsers non trouvé' });
    }

    // Vérifier si le paiement est confirmé
    if (!sessionUser.isPaid || sessionUser.payments.length === 0) {
      return res.status(403).json({ message: 'Paiement non confirmé' });
    }

    const { user, session } = sessionUser;

    // Préparer les données pour le template
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
    const fileName = `attestation_${user.nom}_${user.prenom}_${sessionUserId}.pdf`; // Ajout de sessionUserId pour unicité
    const filePath = path.join(documentsDir, fileName);

    // Générer le PDF
    await new Promise((resolve, reject) => {
      pdf.create(html, options).toFile(filePath, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    res.status(200).json({ message: 'PDF généré', filePath: filePath });
  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
  }
}