import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AuthPayload } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "./email.service.js";

const registerSchema = z.object({
  nombre: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(6).max(100)
});

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** Hashea un token de recuperacion antes de guardarlo en base de datos. */
function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Genera un JWT de sesion con vigencia de 7 dias. */
function createToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

/** Crea registros iniciales de progreso para un jugador nuevo. */
async function createInitialProgress(jugadorId: number): Promise<void> {
  const niveles = await prisma.nivel.findMany({ orderBy: { numero: "asc" } });

  await prisma.progreso.create({
    data: {
      jugadorId,
      nivelDesbloqueado: 1
    }
  });

  if (niveles.length > 0) {
    await prisma.progresoNivel.createMany({
      data: niveles.map((nivel: { id: number }) => ({
        jugadorId,
        nivelId: nivel.id,
        mejorPuntaje: 0,
        completado: false
      }))
    });
  }
}

/** Registra un jugador, crea su progreso y devuelve token JWT. */
export async function registerPlayer(input: unknown) {
  const data = registerSchema.parse(input);

  const existingPlayer = await prisma.jugador.findUnique({
    where: { email: data.email }
  });

  if (existingPlayer) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const jugador = await prisma.jugador.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash
    }
  });

  await createInitialProgress(jugador.id);

  const token = createToken({
    jugadorId: jugador.id,
    email: jugador.email
  });

  return {
    token,
    jugador: {
      id: jugador.id,
      nombre: jugador.nombre,
      email: jugador.email
    }
  };
}

/** Valida credenciales y devuelve token JWT con datos del jugador. */
export async function loginPlayer(input: unknown) {
  const data = loginSchema.parse(input);

  const jugador = await prisma.jugador.findUnique({
    where: { email: data.email }
  });

  if (!jugador) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    jugador.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = createToken({
    jugadorId: jugador.id,
    email: jugador.email
  });

  return {
    token,
    jugador: {
      id: jugador.id,
      nombre: jugador.nombre,
      email: jugador.email
    }
  };
}

/** Obtiene el perfil publico de un jugador por su ID. */
export async function getPlayerProfile(jugadorId: number) {
  const jugador = await prisma.jugador.findUnique({
    where: { id: jugadorId },
    select: {
      id: true,
      nombre: true,
      email: true,
      creadoEn: true
    }
  });

  if (!jugador) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  return jugador;
}

/** Genera token de recuperacion y envia enlace por correo o consola. */
export async function requestPasswordReset(input: unknown) {
  const data = forgotPasswordSchema.parse(input);

  const jugador = await prisma.jugador.findUnique({
    where: { email: data.email }
  });

  if (!jugador) {
    return {
      message:
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
    };
  }

  await prisma.passwordResetToken.deleteMany({
    where: { jugadorId: jugador.id }
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      jugadorId: jugador.id,
      tokenHash,
      expiresAt
    }
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(jugador.email, resetUrl);

  return {
    message:
      "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
  };
}

/** Valida token de recuperacion y actualiza la contrasena del jugador. */
export async function resetPassword(input: unknown) {
  const data = resetPasswordSchema.parse(input);
  const tokenHash = hashResetToken(data.token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { jugador: true }
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error("INVALID_RESET_TOKEN");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.$transaction([
    prisma.jugador.update({
      where: { id: resetToken.jugadorId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.deleteMany({
      where: { jugadorId: resetToken.jugadorId }
    })
  ]);

  return {
    message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
  };
}
