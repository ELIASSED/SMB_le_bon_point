import request from "supertest";
import { createServer, Server } from "http";
import { parse } from "url";
import next from "next";

// Mock Stripe
const stripeMock = {
  paymentIntents: {
    retrieve: jest.fn().mockResolvedValue({ status: "succeeded" }),
  },
};
jest.mock("stripe", () => jest.fn(() => stripeMock));

// Mock Prisma
const prismaMock = {
  sessionUsers: {
    findUnique: jest.fn().mockResolvedValue({ sessionId: 1, userId: 1, isPaid: false }),
    update: jest.fn().mockResolvedValue({ sessionId: 1, userId: 1, isPaid: true }),
  },
  session: {
    findUnique: jest.fn().mockResolvedValue({ id: 1, capacity: 1 }),
  },
};
jest.mock("@/lib/prisma", () => prismaMock);

const app = next({ dev: true });
const handle = app.getRequestHandler();
let server: Server;

describe("POST /api/confirm-payment", () => {
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

  it("confirme le paiement avec succès", async () => {
    const response = await request(server)
      .post("/api/confirm-payment")
      .send({ sessionId: 1, userId: 1, paymentIntentId: "pi_mock" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  }, 10000);
});