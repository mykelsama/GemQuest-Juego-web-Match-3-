/** Rutas HTTP de progreso del jugador y resultados de partida. */
import { Router } from "express";

import { authMiddleware } from "../middleware/auth.js";
import {
  getPlayerProgress,
  listLevels,
  saveLevelResult
} from "../services/progress.service.js";

const router = Router();

/** Lista niveles disponibles desde la base de datos. */
router.get("/levels", async (_req, res) => {
  const levels = await listLevels();
  res.json(levels);
});

/** Obtiene nivel desbloqueado y mejores puntajes del jugador. */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const progress = await getPlayerProgress(req.user!.jugadorId);
    res.json(progress);
  } catch {
    res.status(404).json({ error: "Progreso no encontrado." });
  }
});

/** Guarda el resultado de una partida y actualiza progreso. */
router.post("/level-result", authMiddleware, async (req, res) => {
  try {
    const progress = await saveLevelResult(req.user!.jugadorId, req.body);
    res.json(progress);
  } catch (error) {
    if (error instanceof Error && error.message === "LEVEL_NOT_FOUND") {
      res.status(404).json({ error: "Nivel no encontrado." });
      return;
    }

    res.status(400).json({ error: "Datos de resultado inválidos." });
  }
});

export default router;
