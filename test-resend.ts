// test-resend.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("Resend instance:", resend);