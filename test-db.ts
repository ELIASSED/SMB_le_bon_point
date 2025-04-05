// test-db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Connexion réussie à la base de données !");
  } catch (error) {
    console.error("Erreur de connexion :", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();