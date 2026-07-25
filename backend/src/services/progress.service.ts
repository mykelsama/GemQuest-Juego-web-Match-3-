import { z } from "zod";

import { prisma } from "../lib/prisma.js";

const saveResultSchema = z.object({
  level: z.number().int().min(1).max(3),
  score: z.number().int().min(0),
  won: z.boolean(),
  movesUsed: z.number().int().min(0).optional(),
  levelTimeSeconds: z.number().int().min(0).optional()
});

/** Devuelve nivel desbloqueado y mejores puntajes del jugador. */
export async function getPlayerProgress(jugadorId: number) {
  const [progreso, progresoNivel, niveles] = await Promise.all([
    prisma.progreso.findUnique({ where: { jugadorId } }),
    prisma.progresoNivel.findMany({
      where: { jugadorId },
      include: { nivel: true }
    }),
    prisma.nivel.findMany({ orderBy: { numero: "asc" } })
  ]);

  const bestScores: Record<number, number> = {};

  for (const nivel of niveles) {
    bestScores[nivel.numero] = 0;
  }

  for (const item of progresoNivel) {
    bestScores[item.nivel.numero] = item.mejorPuntaje;
  }

  return {
    unlockedLevel: progreso?.nivelDesbloqueado ?? 1,
    bestScores
  };
}

/** Persiste resultado de partida, actualiza progreso y registra historial. */
export async function saveLevelResult(jugadorId: number, input: unknown) {
  const data = saveResultSchema.parse(input);

  const nivel = await prisma.nivel.findUnique({
    where: { numero: data.level }
  });

  if (!nivel) {
    throw new Error("LEVEL_NOT_FOUND");
  }

  const progreso = await prisma.progreso.findUnique({
    where: { jugadorId }
  });

  if (!progreso) {
    throw new Error("PROGRESS_NOT_FOUND");
  }

  const progresoNivel = await prisma.progresoNivel.findUnique({
    where: {
      jugadorId_nivelId: {
        jugadorId,
        nivelId: nivel.id
      }
    }
  });

  const currentBestScore = progresoNivel?.mejorPuntaje ?? 0;
  const newBestScore = Math.max(currentBestScore, data.score);

  let nivelDesbloqueado = progreso.nivelDesbloqueado;

  if (data.won && data.level >= progreso.nivelDesbloqueado && data.level < 3) {
    nivelDesbloqueado = data.level + 1;
  }

  await prisma.$transaction([
    prisma.progreso.update({
      where: { jugadorId },
      data: { nivelDesbloqueado }
    }),
    prisma.progresoNivel.upsert({
      where: {
        jugadorId_nivelId: {
          jugadorId,
          nivelId: nivel.id
        }
      },
      update: {
        mejorPuntaje: newBestScore,
        completado: data.won ? true : progresoNivel?.completado ?? false
      },
      create: {
        jugadorId,
        nivelId: nivel.id,
        mejorPuntaje: newBestScore,
        completado: data.won
      }
    }),
    prisma.partida.create({
      data: {
        jugadorId,
        nivelId: nivel.id,
        puntaje: data.score,
        movimientosUsados: data.movesUsed ?? 0,
        tiempoNivelSegundos: data.levelTimeSeconds ?? 0,
        resultado: data.won ? "victoria" : "derrota"
      }
    })
  ]);

  return getPlayerProgress(jugadorId);
}

/** Lista los niveles configurados en base de datos. */
export async function listLevels() {
  const niveles = await prisma.nivel.findMany({
    orderBy: { numero: "asc" }
  });

  return niveles.map((nivel: {
    numero: number;
    objetivo: string;
    movimientosMaximos: number;
    puntajeMeta: number | null;
    configuracionJson: unknown;
  }) => ({
    id: nivel.numero,
    title: (nivel.configuracionJson as { title?: string }).title ?? `Nivel ${nivel.numero}`,
    objective: nivel.objetivo,
    moves: nivel.movimientosMaximos,
    targetScore: nivel.puntajeMeta,
    config: nivel.configuracionJson
  }));
}
