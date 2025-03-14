import request from "supertest";
import { createServer, Server } from "http";
import { parse } from "url";
import next from "next";
import Stripe from "stripe";

const stripeMock = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ client_secret: "mock_client_secret" }),
  },
};
jest.mock("stripe", () => jest.fn(() => stripeMock));

const app = next({ dev: true });
const handle = app.getRequestHandler();
let server: Server;

describe("POST /api/create-payment-intent", () => {
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(0);
  }, 100000); // Timeout de 10 secondes

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a payment intent successfully", async () => {
    const response = await request(server)
      .post("/api/create-payment-intent")
      .send({ amount: 20000, currency: "eur" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("clientSecret", "mock_client_secret");
  }, 10000); // Timeout de 10 secondes

  it("rejects payment with missing amount or currency", async () => {
    const response = await request(server)
      .post("/api/create-payment-intent")
      .send({ amount: 20000 })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Montant et devise requis");
  }, 10000); // Timeout de 10 secondes
});