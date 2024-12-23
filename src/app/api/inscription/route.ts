import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Avec prisma 4+, on peut utiliser l'import direct

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const civilite = formData.get('civilite') as string;
    const nom = formData.get('nom') as string;
    const prenom = formData.get('prenom') as string;
    const adresse = formData.get('adresse') as string;
    const codePostal = formData.get('codePostal') as string;
    const ville = formData.get('ville') as string;
    const telephone = formData.get('telephone') as string;
    const email = formData.get('email') as string;
    const confirmationEmail = formData.get('confirmationEmail') as string;
    const stageIdStr = formData.get('stageId') as string;
    const dateNaissanceStr = formData.get('dateNaissance') as string;
    const nationalite = formData.get('nationalite') as string | null;
    
    // Pièces jointes
    const pieceIdentiteFile = formData.get('pieceIdentite') as File | null;
    const permisFile = formData.get('permis') as File | null;

    // Convertir stageId et dateNaissance
    const stageId = stageIdStr ? parseInt(stageIdStr, 10) : null;
    const dateNaissance = dateNaissanceStr ? new Date(dateNaissanceStr) : null;

    if (!confirmationEmail || confirmationEmail !== email) {
      return NextResponse.json({ error: "Les emails ne correspondent pas." }, { status: 400 });
    }

    if (!stageId) {
      return NextResponse.json({ error: "L'ID du stage est requis." }, { status: 400 });
    }

    // Vérifier que la session existe et a encore des places disponibles
    const session = await prisma.session.findUnique({
      where: { id: stageId },
    });

    if (!session) {
      return NextResponse.json({ error: "La session n'existe pas." }, { status: 404 });
    }

    if (session.capacity <= 0) {
      return NextResponse.json({ error: "Il n'y a plus de places disponibles pour cette session." }, { status: 400 });
    }

    // Créer ou mettre à jour l'utilisateur
    const user = await prisma.user.upsert({
      where: { email },
      create: {
  email,
  // @ts-expect-error: TypeScript doesn't recognize `firstName` yet, but it's valid.
  firstName: prenom,
  lastName: nom,
  phone: telephone,
},

    
      update: {
        firstName: prenom,
        lastName: nom,
        phone: telephone,
      },
    });

    // Convertir les fichiers en chemin ou base64 si nécessaire
    // Ici, par exemple, on stocke juste le nom de fichier, mais dans un vrai cas
    // vous devriez les uploader quelque part et stocker le chemin
    let idCard = '';
    let permis = '';

    if (pieceIdentiteFile) {
      // Gérer l'upload du fichier pieceIdentiteFile
      // Exemple : idCard = await uploadFile(pieceIdentiteFile)
      // Pour le moment, on met juste le nom du fichier
      idCard = pieceIdentiteFile.name;
    }

    if (permisFile) {
      // Gérer l'upload du fichier permisFile
      // Exemple : permis = await uploadFile(permisFile)
      permis = permisFile.name;
    }

    // Créer l'inscription
    const inscription = await prisma.inscription.create({
      data: {
        civilite,
        nom,
        prenom,
        adresse,
        codePostal,
        ville,
        telephone,
        email,
        stage: session.numeroStagePrefecture,
        nationalite: nationalite || '',
        dateNaissance: dateNaissance || new Date(),
        idCard,
        permis,
      },
    });

    // Mettre à jour la capacité de la session (-1)
    await prisma.session.update({
      where: { id: stageId },
      data: {
        capacity: session.capacity - 1,
      },
    });

    return NextResponse.json({ inscription, user }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
