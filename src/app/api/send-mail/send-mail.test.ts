import request from "supertest";
import { createServer, Server } from "http";
import { parse } from "url";
import next from "next";

jest.mock("../../../lib/mailer", () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: "mock_message_id" }),
}));

jest.mock("../../../lib/env", () => ({
  env: {
    EMAIL_USER: "test@example.com",
    EMAIL_PASS: "password",
  },
}));

const app = next({ dev: true });
const handle = app.getRequestHandler();
let server: Server;

describe("POST /api/send-mail", () => {
  beforeAll(async () => {
    await app.prepare();
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(0);
  }, 10000); // Timeout de 10 secondes

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends email successfully", async () => {
    const emailData = {
      to: "recipient@example.com",
      subject: "Test Subject",
      text: "Test Text",
      html: "<p>Test HTML</p>",
    };

    const response = await request(server)
      .post("/api/send-mail")
      .send(emailData)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.message).toBe("Email envoyé avec succès");
  }, 10000); // Timeout de 10 secondes

  it("rejects email with missing fields", async () => {
    const response = await request(server)
      .post("/api/send-mail")
      .send({ to: "recipient@example.com", subject: "Test" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("obligatoires");
  }, 10000); // Timeout de 10 secondes
});