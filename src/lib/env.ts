// lib/env.ts
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const env = {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};