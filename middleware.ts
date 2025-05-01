import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function middleware(req) {
  const sessionToken = req.cookies.get('session-token')?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  const session = await prisma.authSession.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};