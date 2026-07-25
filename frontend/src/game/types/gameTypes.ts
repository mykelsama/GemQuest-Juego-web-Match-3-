/** Tipos base del tablero y las gemas del juego Match-3. */
export type GemColor = "blue" | "purple" | "green" | "yellow" | "red";

export type Gem = {
    id: string;
    row: number;
    col: number;
    color: GemColor;
};

export type Board = Gem[][];

export type Position = {
    row: number;
    col: number;
};
