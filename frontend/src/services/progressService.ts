import { apiFetch } from "../config/api";
import { getToken } from "./authService";
import { recordLocalScore } from "./scoresService";

export type LevelProgress = {
  unlockedLevel: number;
  bestScores: Record<number, number>;
};

const STORAGE_KEY = "gemquest_progress";

const defaultProgress: LevelProgress = {
  unlockedLevel: 1,
  bestScores: {
    1: 0,
    2: 0,
    3: 0
  }
};

/** Lee el progreso guardado localmente para modo invitado. */
function getLocalProgress(): LevelProgress {
  const storedProgress = localStorage.getItem(STORAGE_KEY);

  if (!storedProgress) {
    return defaultProgress;
  }

  return JSON.parse(storedProgress) as LevelProgress;
}

/** Guarda el progreso local en localStorage. */
function saveLocalProgress(progress: LevelProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/** Obtiene progreso desde la API o localStorage segun haya sesion. */
export async function getProgress(): Promise<LevelProgress> {
  if (!getToken()) {
    return getLocalProgress();
  }

  try {
    return await apiFetch<LevelProgress>("/api/progress");
  } catch {
    return getLocalProgress();
  }
}

/** Guarda el resultado de una partida en API o localStorage. */
export async function saveLevelResult(
  level: number,
  score: number,
  won: boolean,
  movesUsed = 0,
  levelTimeSeconds = 0
): Promise<LevelProgress> {
  if (!getToken()) {
    const progress = getLocalProgress();
    const currentBestScore = progress.bestScores[level] ?? 0;

    if (score > currentBestScore) {
      progress.bestScores[level] = score;
    }

    if (won && level >= progress.unlockedLevel && level < 3) {
      progress.unlockedLevel = level + 1;
    }

    saveLocalProgress(progress);
    recordLocalScore(level, score, won, levelTimeSeconds);
    return progress;
  }

  try {
    return await apiFetch<LevelProgress>("/api/progress/level-result", {
      method: "POST",
      body: JSON.stringify({ level, score, won, movesUsed, levelTimeSeconds })
    });
  } catch {
    const progress = getLocalProgress();
    saveLocalProgress(progress);
    recordLocalScore(level, score, won, levelTimeSeconds);
    return progress;
  }
}
