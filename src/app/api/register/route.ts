import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

type UserData = {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1?: string;
  prenom2?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  nationalite: string;
  dateNaissance: string;
  codePostalNaissance: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  id_recto?: string;
  id_verso?: string;
  permis_recto?: string;
  permis_verso?: string;
};

type RegisterRequest = {
  stageId: number;
  userData: UserData;
};

type RegisterResponse = {
  message: string;
  user?: any;
  sessionUser?: any;
  error?: string;
};

export async function POST(request: Request) {
  try {
    const { stageId, userData } = (await request.json()) as RegisterRequest;
    console.log('📥 Requête reçue dans /api/register :', { stageId, userData });

    if (!userData || !stageId) {
      console.log('⚠️ Données invalides détectées.');
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    const requiredFields = [
      'civilite',
      'nom',
      'prenom',
      'adresse',
      'codePostal',
      'ville',
      'telephone',
      'email',
      'nationalite',
      'dateNaissance',
      'codePostalNaissance',
      'numeroPermis',
      'dateDelivrancePermis',
      'prefecture',
      'etatPermis',
      'casStage',
    ] as const;
    const missingFields = requiredFields.filter((field) => !userData[field]);
    if (missingFields.length > 0) {
      console.log('⚠️ Champs manquants :', missingFields);
      return NextResponse.json(
        { error: `Champs obligatoires manquants : ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const normalizedEmail = userData.email.toLowerCase().trim();
    const normalizedUserData = {
      civilite: userData.civilite,
      nom: userData.nom,
      prenom: userData.prenom,
      prenom1: userData.prenom1 || null,
      prenom2: userData.prenom2 || null,
      adresse: userData.adresse,
      codePostal: userData.codePostal,
      ville: userData.ville,
      telephone: userData.telephone,
      email: normalizedEmail,
      nationalite: userData.nationalite,
      dateNaissance: new Date(userData.dateNaissance),
      codePostalNaissance: userData.codePostalNaissance,
      numeroPermis: userData.numeroPermis,
      dateDelivrancePermis: new Date(userData.dateDelivrancePermis),
      prefecture: userData.prefecture,
      etatPermis: userData.etatPermis,
      casStage: userData.casStage,
      id_recto: userData.id_recto || null,
      id_verso: userData.id_verso || null,
      permis_recto: userData.permis_recto || null,
      permis_verso: userData.permis_verso || null,
    };

    console.log('🔍 Vérification de la session avec stageId :', stageId);
    const session = await prisma.session.findUnique({ where: { id: stageId } });
    if (!session) {
      console.log('⚠️ Session non trouvée pour stageId :', stageId);
      return NextResponse.json({ error: 'La session n’existe pas.' }, { status: 404 });
    }
    if (session.capacity <= 0) {
      console.log('⚠️ Capacité insuffisante pour stageId :', stageId);
      return NextResponse.json({ error: 'Plus de places disponibles.' }, { status: 400 });
    }

    console.log('🔄 Upsert de l’utilisateur avec email :', normalizedEmail);
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: normalizedUserData,
      create: normalizedUserData,
    });

    console.log('🔄 Transaction pour SessionUsers...');
    const sessionUser = await prisma.$transaction(async (tx) => {
      const existingByDate = await tx.sessionUsers.findFirst({
        where: {
          user: { email: normalizedEmail },
          session: { startDate: session.startDate },
        },
        include: { session: true },
      });
      if (existingByDate) {
        throw new Error(
          `Cet email (${normalizedEmail}) est déjà inscrit à une session débutant le ${session.startDate.toLocaleDateString('fr-FR')}.`
        );
      }

      const existingBySessionId = await tx.sessionUsers.findUnique({
        where: { sessionId_userId: { sessionId: stageId, userId: user.id } },
      });
      if (existingBySessionId) {
        throw new Error('Cet utilisateur est déjà inscrit à cette session.');
      }

      return tx.sessionUsers.create({
        data: {
          sessionId: stageId,
          userId: user.id,
        },
      });
    });

    console.log('✅ Inscription réussie pour l’utilisateur :', user.id);
    return NextResponse.json({
      message: 'Utilisateur inscrit avec succès.',
      user,
      sessionUser,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur dans /api/register :', errMessage, error instanceof Error ? error.stack : '');
    return NextResponse.json({ error: errMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}