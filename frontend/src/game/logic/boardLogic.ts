import type { Board, Gem, GemColor } from "../types/gameTypes";

const GEM_COLORS: GemColor[] = ["blue", "purple", "green", "yellow", "red"];

/** Genera un tablero vacio de gemas sin combinaciones iniciales. */
export function createBoard(rows = 8, cols = 8): Board {
    const board: Board = [];

    for (let row = 0; row < rows; row++) {
        const currentRow: Gem[] = [];

        for (let col = 0; col < cols; col++) {
            const color = getSafeGemColor(board, currentRow, row, col);

            currentRow.push({
                id: `${row}-${col}-${Date.now()}-${Math.random()}`,
                row,
                col,
                color
            });
        }

        board.push(currentRow);
    }

    return board;
}

/** Elige un color que no forme match de 3 al colocar la gema en la celda. */
function getSafeGemColor(
    board: Board,
    currentRow: Gem[],
    row: number,
    col: number
): GemColor {
    const availableColors = [...GEM_COLORS];

    while (availableColors.length > 0) {
        const color = getRandomColorFromList(availableColors);

        if (!createsInitialMatch(board, currentRow, row, col, color)) {
            return color;
        }

        const index = availableColors.indexOf(color);
        availableColors.splice(index, 1);
    }

    return getRandomGemColor();
}

/** Indica si un color crearia una linea de 3 en horizontal o vertical al inicio. */
function createsInitialMatch(
    board: Board,
    currentRow: Gem[],
    row: number,
    col: number,
    color: GemColor
): boolean {
    const hasHorizontalMatch =
        col >= 2 &&
        currentRow[col - 1]?.color === color &&
        currentRow[col - 2]?.color === color;

    const hasVerticalMatch =
        row >= 2 &&
        board[row - 1]?.[col]?.color === color &&
        board[row - 2]?.[col]?.color === color;

    return hasHorizontalMatch || hasVerticalMatch;
}

/** Devuelve un color aleatorio de una lista acotada. */
function getRandomColorFromList(colors: GemColor[]): GemColor {
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
}

/** Devuelve un color aleatorio de todos los tipos disponibles. */
function getRandomGemColor(): GemColor {
    const index = Math.floor(Math.random() * GEM_COLORS.length);
    return GEM_COLORS[index];
}

/** Comprueba si dos gemas son vecinas en fila o columna. */
export function areAdjacent(first: Gem, second: Gem): boolean {
    const rowDiff = Math.abs(first.row - second.row);
    const colDiff = Math.abs(first.col - second.col);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/** Intercambia dos gemas y devuelve un tablero nuevo sin mutar el original. */
export function swapGems(board: Board, first: Gem, second: Gem): Board {
    const newBoard = board.map(row => row.map(gem => ({ ...gem })));

    const firstGem = newBoard[first.row][first.col];
    const secondGem = newBoard[second.row][second.col];

    newBoard[first.row][first.col] = {
        ...secondGem,
        row: first.row,
        col: first.col
    };

    newBoard[second.row][second.col] = {
        ...firstGem,
        row: second.row,
        col: second.col
    };

    return newBoard;
}

/** Encuentra todas las gemas que pertenecen a secuencias de 3 o mas iguales. */
export function findMatches(board: Board): Gem[] {
    const matches: Gem[] = [];

    for (let row = 0; row < board.length; row++) {
        let sequence: Gem[] = [board[row][0]];

        for (let col = 1; col < board[row].length; col++) {
            const currentGem = board[row][col];
            const previousGem = board[row][col - 1];

            if (currentGem.color === previousGem.color) {
                sequence.push(currentGem);
            } else {
                if (sequence.length >= 3) {
                    matches.push(...sequence);
                }

                sequence = [currentGem];
            }
        }

        if (sequence.length >= 3) {
            matches.push(...sequence);
        }
    }

    for (let col = 0; col < board[0].length; col++) {
        let sequence: Gem[] = [board[0][col]];

        for (let row = 1; row < board.length; row++) {
            const currentGem = board[row][col];
            const previousGem = board[row - 1][col];

            if (currentGem.color === previousGem.color) {
                sequence.push(currentGem);
            } else {
                if (sequence.length >= 3) {
                    matches.push(...sequence);
                }

                sequence = [currentGem];
            }
        }

        if (sequence.length >= 3) {
            matches.push(...sequence);
        }
    }

    return matches;
}

/** Elimina gemas coincidentes, hace caer las restantes y rellena con nuevas. */
export function removeMatchesAndRefill(board: Board, matches: Gem[]): Board {
    const matchedPositions = new Set(
        matches.map(gem => `${gem.row}-${gem.col}`)
    );

    const rows = board.length;
    const cols = board[0].length;

    const newBoard: Board = board.map(row =>
        row.map(gem => ({ ...gem }))
    );

    for (let col = 0; col < cols; col++) {
        const remainingGems: Gem[] = [];

        for (let row = rows - 1; row >= 0; row--) {
            const gem = newBoard[row][col];

            if (!matchedPositions.has(`${row}-${col}`)) {
                remainingGems.push(gem);
            }
        }

        for (let row = rows - 1; row >= 0; row--) {
            const existingGem = remainingGems.shift();

            if (existingGem) {
                newBoard[row][col] = {
                    ...existingGem,
                    row,
                    col
                };
            } else {
                newBoard[row][col] = {
                    id: `${row}-${col}-${Date.now()}-${Math.random()}`,
                    row,
                    col,
                    color: getRandomGemColor()
                };
            }
        }
    }

    return newBoard;
}

/** Resuelve cascadas sucesivas hasta que no queden matches en el tablero. */
export function resolveBoardCascades(board: Board): {
    board: Board;
    totalMatches: number;
    redMatches: number;
} {
    let currentBoard = board;
    let totalMatches = 0;
    let redMatches = 0;

    while (true) {
        const matches = findMatches(currentBoard);

        if (matches.length === 0) {
            break;
        }

        totalMatches += matches.length;
        redMatches += matches.filter(gem => gem.color === "red").length;
        currentBoard = removeMatchesAndRefill(currentBoard, matches);
    }

    return {
        board: currentBoard,
        totalMatches,
        redMatches
    };
}
