import request from "supertest";
import { createServer, Server } from "http";
import { parse } from "url";
import next from "next";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const app = next({ dev: true });
const handle = app.getRequestHandler();
let server: Server;

const stripeMock = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
  },
};
jest.mock("stripe", () => jest.fn(() => stripeMock));

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
    update: jest.fn(),
  },
  payment: {
    create: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb({})),
  $disconnect: jest.fn(),
};
jest.mock("@/lib/prisma", () => prismaMock);

// Ajustement du chemin pour correspondre à src/lib/mailer.ts
jest.mock("@/lib/mailer", () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: "mock_message_id" }),
}));
jest.mock("@/lib/env", () => ({
  env: {
    EMAIL_USER: "test@example.com",
    EMAIL_PASS: "password",
  },
}));

describe("Integration Tests in Business Flow Order", () => {
  const baseUserData = {
    civilite: "Monsieur",
    nom: "Dupont",
    prenom: "Jean",
    adresse: "1 Rue Test",
    codePostal: "75001",
    ville: "Paris",
    telephone: "0123456789",
    email: "jean@test.com",
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

  let paymentIntentId: string;
  let userId: number;
  let sessionId: number = 1;

  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(0);
  }, 10000);

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Create Payment Intent", () => {
    it("creates a payment intent successfully", async () => {
      stripeMock.paymentIntents.create.mockResolvedValue({
        id: "pi_mock",
        client_secret: "mock_client_secret",
      });
      const response = await request(server)
        .post("/api/create-payment-intent")
        .send({ amount: 20000, currency: "eur" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("clientSecret", "mock_client_secret");
      paymentIntentId = response.body.paymentIntentId || "pi_mock";
    }, 10000);

    it("rejects payment with missing amount or currency", async () => {
      const response = await request(server)
        .post("/api/create-payment-intent")
        .send({ amount: 20000 })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Montant et devise requis");
    }, 10000);
  });

  describe("2. Register User", () => {
    beforeEach(() => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: sessionId,
        capacity: 20,
        startDate: new Date("2025-04-01"),
        price: 200.0,
      });
      prismaMock.user.upsert.mockResolvedValue({ id: 1, email: baseUserData.email });
      prismaMock.sessionUsers.findFirst.mockResolvedValue(null);
      prismaMock.sessionUsers.findUnique.mockResolvedValue(null);
      prismaMock.sessionUsers.create.mockResolvedValue({
        sessionId,
        userId: 1,
        paymentIntentId,
        isPaid: false,
      });
    });

    it("registers a user successfully with payment intent", async () => {
      const response = await request(server)
        .post("/api/register")
        .send({ stageId: sessionId, userData: baseUserData, paymentIntentId })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Utilisateur inscrit avec succès.");
      userId = 1;
    }, 10000);
  });

  describe("3. Confirm Payment", () => {
    beforeEach(() => {
      prismaMock.sessionUsers.findUnique.mockResolvedValue({
        sessionId,
        userId,
        isPaid: false,
        paymentIntentId,
      });
      prismaMock.session.findUnique.mockResolvedValue({ id: sessionId, capacity: 20 });
      prismaMock.sessionUsers.update.mockResolvedValue({ sessionId, userId, isPaid: true });
      prismaMock.session.update.mockResolvedValue({ id: sessionId, capacity: 19 });
      stripeMock.paymentIntents.retrieve.mockResolvedValue({ status: "succeeded" });
      prismaMock.payment.create.mockResolvedValue({
        id: 1,
        sessionUserId: 1,
        amount: 200.0,
        method: "stripe",
      });
    });

    it("confirms payment successfully", async () => {
      const response = await request(server)
        .post("/api/confirm-payment")
        .send({ sessionId, userId, paymentIntentId })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Paiement confirmé avec succès. Votre place est réservée.");
    }, 10000);
  });

  describe("4. Send Mail", () => {
    it("sends confirmation email successfully", async () => {
      const emailData = {
        to: baseUserData.email,
        subject: "Paiement Confirmé",
        text: "Votre paiement pour la session a été confirmé.",
        html: "<p>Votre paiement pour la session a été confirmé.</p>",
      };

      const response = await request(server)
        .post("/api/send-mail")
        .send(emailData)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Email envoyé avec succès");
    }, 10000);
  });
});