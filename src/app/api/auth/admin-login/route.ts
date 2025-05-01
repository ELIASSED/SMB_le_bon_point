import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Log Prisma client to verify initialization
    console.log('Prisma client initialized:', prisma);

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect.' },
        { status: 401 }
      );
    }

    // Create a session
    const sessionToken = uuidv4();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await prisma.authSession.create({
      data: {
        sessionToken,
        userId: admin.id,
        expires,
      },
    });

    // Set session token in a secure cookie
    cookies().set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires,
    });

    return NextResponse.json({ message: 'Connexion réussie.' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}