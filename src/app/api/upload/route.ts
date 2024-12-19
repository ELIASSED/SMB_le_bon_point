// pages/api/upload.js

import nextConnect from 'next-connect';
import multer from 'multer';
import multerS3 from 'multer-s3';
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

// Configuration Multer-S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'private', // Accès privé
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now().toString()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB par fichier
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      require('path').extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seuls les fichiers JPEG, JPG, PNG et PDF sont autorisés.'));
  },
});

// Middleware pour gérer les uploads
const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error(error);
    res.status(501).json({ error: `Erreur lors de l'upload: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Méthode ${req.method} non autorisée.` });
  },
});

const uploadMiddleware = upload.fields([
  { name: 'imageScan1', maxCount: 1 },
  { name: 'imageScan2', maxCount: 1 },
]);

apiRoute.use(uploadMiddleware);

apiRoute.post(async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId est requis.' });
    }

    if (!req.files['imageScan1'] || !req.files['imageScan2']) {
      return res.status(400).json({ error: 'Les deux scans d\'image sont requis.' });
    }

    const imageScan1 = req.files['imageScan1'][0].location; // URL S3
    const imageScan2 = req.files['imageScan2'][0].location; // URL S3

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        imageScan1: imageScan1,
        imageScan2: imageScan2,
      },
    });

    res.status(200).json({ message: 'Scans uploadés avec succès.', imageScan1, imageScan2 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des scans.' });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Désactive le bodyParser par défaut de Next.js
  },
};
