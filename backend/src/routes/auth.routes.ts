/** Rutas HTTP de autenticacion, registro y recuperacion de contrasena. */
import { Router } from "express";

import {
  getPlayerProfile,
  loginPlayer,
  registerPlayer,
  requestPasswordReset,
  resetPassword
} from "../services/auth.service.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

/** Crea una cuenta nueva y devuelve JWT. */
router.post("/register", async (req, res) => {
  try {
    const result = await registerPlayer(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      res.status(409).json({ error: "El correo ya está registrado." });
      return;
    }

    res.status(400).json({ error: "Datos de registro inválidos." });
  }
});

/** Valida credenciales y devuelve JWT. */
router.post("/login", async (req, res) => {
  try {
    const result = await loginPlayer(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ error: "Correo o contraseña incorrectos." });
      return;
    }

    res.status(400).json({ error: "Datos de inicio de sesión inválidos." });
  }
});

/** Devuelve el perfil del jugador autenticado. */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await getPlayerProfile(req.user!.jugadorId);
    res.json(profile);
  } catch {
    res.status(404).json({ error: "Jugador no encontrado." });
  }
});

/** Solicita enlace de recuperacion de contrasena. */
router.post("/forgot-password", async (req, res) => {
  try {
    const result = await requestPasswordReset(req.body);
    res.json(result);
  } catch {
    res.status(400).json({ error: "Correo inválido." });
  }
});

/** Restablece la contrasena con un token valido. */
router.post("/reset-password", async (req, res) => {
  try {
    const result = await resetPassword(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_RESET_TOKEN") {
      res.status(400).json({ error: "El enlace de recuperación es inválido o expiró." });
      return;
    }

    res.status(400).json({ error: "No se pudo restablecer la contraseña." });
  }
});

export default router;
