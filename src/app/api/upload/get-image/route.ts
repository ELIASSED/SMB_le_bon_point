// pages/api/get-image.js

import AWS from 'aws-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Fonction pour générer une URL pré-signée
const getSignedUrl = (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: 60, // URL valable pendant 60 secondes
  };
  return s3.getSignedUrl('getObject', params);
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Méthode ${req.method} non autorisée.` });
  }

  const { userId, scan } = req.query;

  if (!userId || !scan) {
    return res.status(400).json({ error: 'userId et scan sont requis.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    let key;
    if (scan === 'imageScan1') {
      key = user.imageScan1?.split('.com/')[1];
    } else if (scan === 'imageScan2') {
      key = user.imageScan2?.split('.com/')[1];
    } else {
      return res.status(400).json({ error: 'Scan invalide.' });
    }

    if (!key) {
      return res.status(404).json({ error: 'Image non trouvée.' });
    }

    const url = getSignedUrl(key);
    res.redirect(url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'image.' });
  }
}
