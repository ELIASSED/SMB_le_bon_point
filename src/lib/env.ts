// lib/env.ts
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

console.log("Variables chargées manuellement :", {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
});

export const env = {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};