import { apiFetch } from "../config/api";
import { getToken } from "./authService";
import { levelsConfig } from "../game/config/levels";

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

export type ScoresData = {
  bestScores: ScoreRecord[];
  history: ScoreRecord[];
};

export type GlobalScoresData = {
  bestScores: GlobalScoreRecord[];
};

const SCORES_KEY = "gemquest_scores";

/** Lee puntajes almacenados en localStorage. */
function getLocalScores(): ScoresData {
  const stored = localStorage.getItem(SCORES_KEY);
  if (!stored) {
    return { bestScores: [], history: [] };
  }
  return JSON.parse(stored) as ScoresData;
}

/** Agrega un puntaje al historial local y actualiza records por nivel. */
function saveLocalScore(record: Omit<ScoreRecord, "id">): void {
  const data = getLocalScores();
  const newRecord: ScoreRecord = {
    ...record,
    id: Date.now()
  };

  data.history.unshift(newRecord);

  const currentBest = data.bestScores.find(item => item.nivel === record.nivel);

  if (!currentBest || record.puntaje > currentBest.puntaje) {
    data.bestScores = [
      ...data.bestScores.filter(item => item.nivel !== record.nivel),
      newRecord
    ].sort((a, b) => a.nivel - b.nivel);
  }

  localStorage.setItem(SCORES_KEY, JSON.stringify(data));
}

/** Registra una partida en el almacenamiento local del navegador. */
export function recordLocalScore(
  level: number,
  score: number,
  won: boolean,
  levelTimeSeconds: number
): void {
  const levelConfig = levelsConfig.find(item => item.id === level);

  saveLocalScore({
    nivel: level,
    nivelTitulo: levelConfig?.title ?? `Nivel ${level}`,
    puntaje: score,
    fecha: new Date().toISOString(),
    tiempoNivelSegundos: levelTimeSeconds,
    resultado: won ? "victoria" : "derrota"
  });
}

/** Obtiene puntajes personales desde la API o localStorage. */
export async function getScores(): Promise<ScoresData> {
  if (!getToken()) {
    return getLocalScores();
  }

  try {
    return await apiFetch<ScoresData>("/api/scores");
  } catch {
    return getLocalScores();
  }
}

/** Obtiene el ranking global de todos los jugadores desde la API. */
export async function getGlobalScores(): Promise<GlobalScoresData> {
  return apiFetch<GlobalScoresData>("/api/scores/global");
}

/** Formatea segundos totales como mm:ss. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Formatea una fecha ISO a texto legible en es-EC. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
