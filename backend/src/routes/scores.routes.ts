/** Rutas HTTP de puntajes personales y ranking global. */
import { Router } from "express";

import { authMiddleware } from "../middleware/auth.js";
import { getGlobalBestScores, getPlayerScores } from "../services/scores.service.js";

const router = Router();

/** Devuelve el mejor puntaje de cada jugador por nivel. */
router.get("/global", async (_req, res) => {
  try {
    const scores = await getGlobalBestScores();
    res.json(scores);
  } catch {
    res.status(500).json({ error: "No se pudieron cargar los puntajes globales." });
  }
});

/** Devuelve records e historial del jugador autenticado. */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const scores = await getPlayerScores(req.user!.jugadorId);
    res.json(scores);
  } catch {
    res.status(500).json({ error: "No se pudieron cargar los puntajes." });
  }
});

export default router;
