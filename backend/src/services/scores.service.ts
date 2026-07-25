import { prisma } from "../lib/prisma.js";

export type ScoreRecord = {
  id: number;
  nivel: number;
  nivelTitulo: string;
  puntaje: number;
  fecha: string;
  tiempoNivelSegundos: number;
  resultado: string;
};

export type GlobalScoreRecord = ScoreRecord & {
  jugadorNombre: string;
};

/** Obtiene records e historial de partidas de un jugador. */
export async function getPlayerScores(jugadorId: number) {
  const partidas = await prisma.partida.findMany({
    where: { jugadorId },
    include: { nivel: true },
    orderBy: { fecha: "desc" }
  });

  const history: ScoreRecord[] = partidas.map(partida => ({
    id: partida.id,
    nivel: partida.nivel.numero,
    nivelTitulo:
      (partida.nivel.configuracionJson as { title?: string }).title ??
      `Nivel ${partida.nivel.numero}`,
    puntaje: partida.puntaje,
    fecha: partida.fecha.toISOString(),
    tiempoNivelSegundos: partida.tiempoNivelSegundos,
    resultado: partida.resultado
  }));

  const bestByLevel = new Map<number, ScoreRecord>();

  for (const record of history) {
    const currentBest = bestByLevel.get(record.nivel);

    if (!currentBest || record.puntaje > currentBest.puntaje) {
      bestByLevel.set(record.nivel, record);
    }
  }

  const bestScores = Array.from(bestByLevel.values()).sort(
    (a, b) => a.nivel - b.nivel
  );

  return { bestScores, history };
}

/** Obtiene el mejor puntaje de cada jugador por nivel, ordenado por puntaje. */
export async function getGlobalBestScores() {
  const niveles = await prisma.nivel.findMany({
    orderBy: { numero: "asc" }
  });

  const bestScores: GlobalScoreRecord[] = [];

  for (const nivel of niveles) {
    const partidas = await prisma.partida.findMany({
      where: { nivelId: nivel.id },
      include: { jugador: true, nivel: true },
      orderBy: [{ puntaje: "desc" }, { fecha: "asc" }]
    });

    const bestByPlayer = new Map<number, (typeof partidas)[number]>();

    for (const partida of partidas) {
      const currentBest = bestByPlayer.get(partida.jugadorId);

      if (!currentBest || partida.puntaje > currentBest.puntaje) {
        bestByPlayer.set(partida.jugadorId, partida);
      }
    }

    const rankedEntries = Array.from(bestByPlayer.values()).sort(
      (a, b) => b.puntaje - a.puntaje || a.fecha.getTime() - b.fecha.getTime()
    );

    for (const bestPartida of rankedEntries) {
      bestScores.push({
        id: bestPartida.id,
        nivel: bestPartida.nivel.numero,
        nivelTitulo:
          (bestPartida.nivel.configuracionJson as { title?: string }).title ??
          `Nivel ${bestPartida.nivel.numero}`,
        puntaje: bestPartida.puntaje,
        fecha: bestPartida.fecha.toISOString(),
        tiempoNivelSegundos: bestPartida.tiempoNivelSegundos,
        resultado: bestPartida.resultado,
        jugadorNombre: bestPartida.jugador.nombre
      });
    }
  }

  return { bestScores };
}
