import { describe, expect, it } from "vitest";

import type { Board, Gem } from "../types/gameTypes";
import {
    areAdjacent,
    createBoard,
    findMatches,
    removeMatchesAndRefill,
    swapGems
} from "./boardLogic";

/** Construye una gema de prueba con valores por defecto sobreescribibles. */
function makeGem(overrides: Partial<Gem>): Gem {
    return {
        id: `${overrides.row ?? 0}-${overrides.col ?? 0}`,
        row: 0,
        col: 0,
        color: "blue",
        ...overrides
    };
}

describe("createBoard", () => {
    it("genera un tablero con las dimensiones solicitadas", () => {
        const board = createBoard(8, 8);

        expect(board).toHaveLength(8);
        board.forEach(row => expect(row).toHaveLength(8));
    });

    it("no genera combinaciones de 3 o mas al crear el tablero", () => {
        const board = createBoard(8, 8);

        expect(findMatches(board)).toHaveLength(0);
    });

    it("asigna a cada gema su fila y columna correctas", () => {
        const board = createBoard(5, 5);

        board.forEach((row, rowIndex) => {
            row.forEach((gem, colIndex) => {
                expect(gem.row).toBe(rowIndex);
                expect(gem.col).toBe(colIndex);
            });
        });
    });
});

describe("areAdjacent", () => {
    it("reconoce vecinos horizontales", () => {
        const a = makeGem({ row: 2, col: 2 });
        const b = makeGem({ row: 2, col: 3 });

        expect(areAdjacent(a, b)).toBe(true);
    });

    it("reconoce vecinos verticales", () => {
        const a = makeGem({ row: 2, col: 2 });
        const b = makeGem({ row: 3, col: 2 });

        expect(areAdjacent(a, b)).toBe(true);
    });

    it("rechaza gemas en diagonal", () => {
        const a = makeGem({ row: 2, col: 2 });
        const b = makeGem({ row: 3, col: 3 });

        expect(areAdjacent(a, b)).toBe(false);
    });

    it("rechaza gemas lejanas en la misma fila", () => {
        const a = makeGem({ row: 2, col: 2 });
        const b = makeGem({ row: 2, col: 5 });

        expect(areAdjacent(a, b)).toBe(false);
    });
});

describe("swapGems", () => {
    it("intercambia posiciones sin mutar el tablero original", () => {
        const board = createBoard(4, 4);
        const first = board[0][0];
        const second = board[0][1];

        const newBoard = swapGems(board, first, second);

        expect(newBoard[0][0].color).toBe(second.color);
        expect(newBoard[0][1].color).toBe(first.color);
        // El tablero original no cambia (inmutabilidad).
        expect(board[0][0].color).toBe(first.color);
        expect(board[0][1].color).toBe(second.color);
    });
});

describe("findMatches", () => {
    function buildUniformBoard(rows: number, cols: number): Board {
        const board: Board = [];
        for (let r = 0; r < rows; r++) {
            const row: Gem[] = [];
            for (let c = 0; c < cols; c++) {
                row.push(makeGem({ row: r, col: c, color: "blue" }));
            }
            board.push(row);
        }
        return board;
    }

    it("detecta una linea horizontal de 3 o mas", () => {
        const board = buildUniformBoard(3, 3);
        const matches = findMatches(board);

        expect(matches.length).toBeGreaterThan(0);
    });

    it("no detecta matches cuando no hay 3 gemas iguales seguidas", () => {
        const board: Board = [
            [
                makeGem({ row: 0, col: 0, color: "blue" }),
                makeGem({ row: 0, col: 1, color: "red" }),
                makeGem({ row: 0, col: 2, color: "blue" })
            ]
        ];

        expect(findMatches(board)).toHaveLength(0);
    });
});

describe("removeMatchesAndRefill", () => {
    it("rellena las celdas eliminadas para mantener el tamano del tablero", () => {
        const board = createBoard(5, 5);
        const matches = [board[4][0], board[4][1], board[4][2]];

        const newBoard = removeMatchesAndRefill(board, matches);

        expect(newBoard).toHaveLength(5);
        newBoard.forEach(row => expect(row).toHaveLength(5));
    });

    it("hace caer las gemas restantes hacia abajo en cada columna", () => {
        const board = createBoard(4, 1);
        const bottomGemColor = board[3][0].color;
        const matches = [board[0][0]];

        const newBoard = removeMatchesAndRefill(board, matches);

        expect(newBoard[3][0].color).toBe(bottomGemColor);
    });
});