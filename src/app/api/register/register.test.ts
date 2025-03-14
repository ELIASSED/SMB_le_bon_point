import request from "supertest";
import { createServer, Server } from "http";
import { parse } from "url";
import next from "next";
import { PrismaClient } from "@prisma/client";

// Typage explicite pour Prisma mocké
const prismaMock = {
  session: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    upsert: jest.fn(),
  },
  sessionUsers: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb({})), // Typage temporaire pour cb
  $disconnect: jest.fn(),
};

jest.mock("@/lib/prisma", () => prismaMock);

const app = next({ dev: true });
const handle = app.getRequestHandler();
let server: Server;

describe("POST /api/register", () => {
  const baseUserData = {
    civilite: "Monsieur",
    nom: "Dupont",
    prenom: "Jean",
    adresse: "1 Rue Test",
    codePostal: "75001",
    ville: "Paris",
    telephone: "0123456789",
    email: "seddiki.elias7@gmail.com",
    nationalite: "France",
    dateNaissance: "1990-01-01",
    codePostalNaissance: "75001",
    numeroPermis: "12AB34567",
    dateDelivrancePermis: "2020-01-01",
    prefecture: "Paris",
    etatPermis: "Valide",
    casStage: "Description 1",
    permis_recto: "https://mock.url",
  };

  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.session.findUnique.mockResolvedValue({ id: 1, capacity: 10, startDate: new Date("2025-04-01") });
    prismaMock.user.upsert.mockResolvedValue({ id: 1, email: "jean@test.com" });
    prismaMock.sessionUsers.findFirst.mockResolvedValue(null);
    prismaMock.sessionUsers.findUnique.mockResolvedValue(null);
    prismaMock.sessionUsers.create.mockResolvedValue({ sessionId: 1, userId: 1 });
  });

  it("registers a user successfully", async () => {
    const response = await request(server)
      .post("/api/register")
      .send({ stageId: 1, userData: baseUserData })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Utilisateur inscrit avec succès.");
    expect(prismaMock.user.upsert).toHaveBeenCalled();
    expect(prismaMock.sessionUsers.create).toHaveBeenCalled();
  });

  it("rejects registration with missing fields", async () => {
    const incompleteData = { nom: "Dupont", email: "jean@test.com" };
    const response = await request(server)
      .post("/api/register")
      .send({ stageId: 1, userData: incompleteData })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Champs obligatoires manquants");
  });

  it("handles concurrent registrations", async () => {
    const users = Array.from({ length: 5 }, (_, i) => ({
      stageId: 1,
      userData: { ...baseUserData, email: `jean${i}@test.com`, numeroPermis: `12AB3456${i}` },
    }));

    const requests = users.map((data) =>
      request(server)
        .post("/api/register")
        .send(data)
        .set("Content-Type", "application/json")
    );

    const responses = await Promise.all(requests);

    responses.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Utilisateur inscrit avec succès.");
    });
    expect(prismaMock.sessionUsers.create).toHaveBeenCalledTimes(5);
  });

  it("rejects duplicate registration for same session", async () => {
    prismaMock.sessionUsers.findUnique.mockResolvedValueOnce({ sessionId: 1, userId: 1 });

    const response = await request(server)
      .post("/api/register")
      .send({ stageId: 1, userData: baseUserData })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Cet utilisateur est déjà inscrit à cette session.");
  });

  it("rejects registration when capacity is zero", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({ id: 1, capacity: 0, startDate: new Date("2025-04-01") });

    const response = await request(server)
      .post("/api/register")
      .send({ stageId: 1, userData: baseUserData })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Plus de places disponibles.");
  });
});