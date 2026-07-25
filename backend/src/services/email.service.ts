import nodemailer from "nodemailer";

import { env, isSmtpConfigured } from "../config/env.js";

/** Crea el transporte SMTP si las variables de entorno estan configuradas. */
function createTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

/** Envia correo de recuperacion o imprime el enlace en consola en desarrollo. */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<"sent" | "logged"> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("[GemQuest] SMTP no configurado. Enlace de recuperación:");
    console.log(resetUrl);
    return "logged";
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Recuperar contraseña - GemQuest",
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña en GemQuest.</p>
      <p>
        <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">
          Restablecer contraseña
        </a>
      </p>
      <p>Este enlace expira en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `
  });

  return "sent";
}
