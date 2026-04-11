import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { ReactElement } from "react";

export { WelcomeEmail } from "./templates/welcome";
export { ResetPasswordEmail } from "./templates/reset-password";
export { InviteEmail } from "./templates/invite";
export { VerifyEmailEmail } from "./templates/verify-email";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  from = "onboarding@resend.dev",
}: SendEmailOptions) {
  // Use local SMTP (Mailpit) when SMTP_HOST is set, otherwise use Resend
  if (process.env.SMTP_HOST) {
    const html = await render(react);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false,
    });
    return transport.sendMail({ from, to, subject, html });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({ from, to, subject, react });
  if (error) throw new Error(`Failed to send email: ${error.message}`);
  return data;
}
