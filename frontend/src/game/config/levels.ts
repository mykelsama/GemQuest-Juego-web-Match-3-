import type { GemColor } from "../types/gameTypes";

export type ObjectiveType = "score" | "collect";

export type LevelConfig = {
    id: number;
    title: string;
    objective: string;
    objectiveType: ObjectiveType;
    targetScore?: number;
    targetColor?: GemColor;
    targetCount?: number;
    moves: number;
};

/** Configuracion estatica de los 3 niveles del juego. */
export const levelsConfig: LevelConfig[] = [
    {
        id: 1,
        title: "Bosque Cristalino",
        objective: "Alcanza 3800 puntos",
        objectiveType: "score",
        targetScore: 3800,
        moves: 15
    },
    {
        id: 2,
        title: "Cueva de Rubíes",
        objective: "Elimina 36 gemas rojas",
        objectiveType: "collect",
        targetColor: "red",
        targetCount: 36,
        moves: 16
    },
    {
        id: 3,
        title: "Templo Obsidiana",
        objective: "Alcanza 7200 puntos",
        objectiveType: "score",
        targetScore: 7200,
        moves: 12
    }
];

/** Obtiene la configuracion de un nivel; usa el nivel 1 como fallback. */
export function getLevelConfig(levelId: number): LevelConfig {
    return levelsConfig.find(level => level.id === levelId) ?? levelsConfig[0];
}
