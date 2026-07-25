import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getLevelConfig } from "../../game/config/levels";
import {
    areAdjacent,
    createBoard,
    findMatches,
    resolveBoardCascades,
    swapGems
} from "../../game/logic/boardLogic";
import { saveLevelResult } from "../../services/progressService";
import type { Gem } from "../../game/types/gameTypes";
import { gemImages } from "../../assets/images/gems";
import { getLevelBackground } from "../../assets/images/levelBackgrounds";
import {
    pauseBGM,
    playCascade,
    playDefeat,
    playInvalid,
    playMatch,
    playSelect,
    playVictory,
    resumeBGM,
    startBGM,
    stopBGM
} from "../../assets/sound/soundManager";
import "./Game.css";

const MATCH_ANIMATION_MS = 400;

/** Pantalla principal del juego Match-3 con HUD, tablero y modal de resultado. */
export default function Game(){

    /* Navegación y parámetro de nivel desde la URL. */
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const level = searchParams.get("level") ?? "1";
    const currentLevel = Number(level);
    const levelConfig = getLevelConfig(currentLevel);

    /* Estado principal de la partida. */
    const [board, setBoard] = useState(()=>createBoard());

    const [selectedGem, setSelectedGem] = useState<Gem | null>(null);

    const [matchedGemIds, setMatchedGemIds] = useState<string[]>([]);

    const [score, setScore] = useState(0);
    
    const [moves, setMoves] = useState(levelConfig.moves);

    const [redCollected, setRedCollected] = useState(0);

    const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    /* Marca el momento de inicio para calcular el tiempo total del nivel. */
    const levelStartTime = useRef<number | null>(null); // 1. Inicializa como null

    useEffect(() => {
      levelStartTime.current = Date.now(); // 2. Asigna el valor aquí para mantener la pureza
    }, []);

    /* Detiene la musica de fondo al desmontar el componente. */
    useEffect(() => () => stopBGM(), []);

    /* Pausa/reanuda la musica cuando se pausa/reanuda la partida. */
    useEffect(() => {
        if (isPaused) {
            pauseBGM();
        } else {
            resumeBGM();
        }
    }, [isPaused]);

    /* Detiene la musica al terminar la partida (victoria o derrota). */
    useEffect(() => {
        if (gameResult) {
            stopBGM();
        }
    }, [gameResult]);

    /** Gestiona seleccion, intercambio, puntuacion y fin de partida al hacer click en gemas. */
    const handleGemClick = (gem:Gem) => {

        /* Inicia la musica al primer click del usuario (requisito del autoplay del navegador). */
        startBGM();

        /* Si la partida ya terminó, no se aceptan más jugadas. */
        if(gameResult || isPaused){
           return;
        }

        /* Primera gema elegida: solo se guarda como selección. */
        if(!selectedGem){
            playSelect();
            setSelectedGem(gem);
            return;
        }

        /* Si el usuario vuelve a pulsar la misma gema, se deselecciona. */
        if(selectedGem.id === gem.id){
            setSelectedGem(null);
            return;
        }

        /* Solo se permite intercambio entre gemas adyacentes. */
        if(areAdjacent(selectedGem, gem)){
            const updatedBoard = swapGems(board, selectedGem, gem);
            const matches = findMatches(updatedBoard);

            /* El intercambio fue válido porque generó al menos una coincidencia. */
            if(matches.length > 0){
                console.log("Movimiento válido. Coincidencias encontradas:", matches);
                playMatch(matches.length);

                const matchIds = matches.map(match => match.id);

                setBoard(updatedBoard);
                setMatchedGemIds(matchIds);

                /* Se espera a que termine la animación antes de resolver cascadas y puntaje. */
                setTimeout(async () => {
                    const cascadeResult = resolveBoardCascades(updatedBoard);
                    playCascade();

                    /* Calcula el avance de la jugada antes de evaluar victoria o derrota. */
                    const totalPoints = cascadeResult.totalMatches * 100;
                    const newScore = score + totalPoints;
                    const newMoves = moves - 1;
                    const newRedCollected = redCollected + cascadeResult.redMatches;
                    const movesUsed = levelConfig.moves - newMoves;
                    const levelTimeSeconds = Math.floor(
                        (Date.now() - (levelStartTime.current ?? Date.now())) / 1000
                    );

                    setScore(newScore);
                    setMoves(newMoves);
                    setRedCollected(newRedCollected);
                    setBoard(cascadeResult.board);
                    setMatchedGemIds([]);

                    /* Condición de victoria según el tipo de objetivo del nivel. */
                    const wonByScore =
                        levelConfig.objectiveType === "score" &&
                        newScore >= (levelConfig.targetScore ?? 0);

                    const wonByCollection =
                        levelConfig.objectiveType === "collect" &&
                        newRedCollected >= (levelConfig.targetCount ?? 0);

                    /* Guarda el resultado y muestra el modal final. */
                    if(wonByScore || wonByCollection){
                        playVictory();
                        await saveLevelResult(
                            currentLevel,
                            newScore,
                            true,
                            movesUsed,
                            levelTimeSeconds
                        );
                        setGameResult("win");
                    }else if(newMoves <= 0){
                        playDefeat();
                        await saveLevelResult(
                            currentLevel,
                            newScore,
                            false,
                            movesUsed,
                            levelTimeSeconds
                        );
                        setGameResult("lose");
                    }
                }, MATCH_ANIMATION_MS);
            }else{
                /* El intercambio no produjo match, así que se revierte visualmente. */
                console.log("Movimiento inválido. No genera combinación.");
                playInvalid();
                setBoard(board);
            }
        }else{
            /* No se permite interactuar con gemas que no están juntas. */
            console.log("No son adyacentes");
        }

        setSelectedGem(null);
    };

    return(
        <main
            className="gamePage"
            data-result={gameResult ?? "playing"}
            data-level={currentLevel}
            style={{ backgroundImage: `url(${getLevelBackground(currentLevel)})` }}
        >

            {/* Barra superior con navegación y título del juego. */}
            <header className="gameHeader">
                <button
                    className="gameBack"
                    onClick={()=>navigate("/levels")}
                >
                    ← Niveles
                </button>

                <h1>GemQuest</h1>
            </header>

            {/* Panel principal: HUD lateral y tablero de juego. */}
            <section className="gamePanel">

                {/* Datos del nivel: progreso, objetivo y recursos restantes. */}
                <aside className="hud">

                    <div className="hudItem">
                        <p className="hudLabel">Nivel</p>
                        <p className="hudValue">{levelConfig.id}</p>
                    </div>

                    <div className="hudItem">
                        <p className="hudLabel">Zona</p>
                        <p className="hudValue">{levelConfig.title}</p>
                    </div>

                    <div className="hudItem">
                        <p className="hudLabel">Puntaje</p>
                        <p className="hudValue">{score}</p>
                    </div>

                    <div className="hudItem">
                        <p className="hudLabel">Movimientos</p>
                        <p className="hudValue">{moves}</p>
                    </div>

                    <div className="hudItem">
                        <p className="hudLabel">Objetivo</p>
                        <p className="hudValue objective">
                            {levelConfig.objectiveType === "score"
                                ? `${levelConfig.targetScore} pts`
                                : `${redCollected}/${levelConfig.targetCount} rojas`}
                        </p>
                    </div>

                    <button
                        className="pauseButton"
                        onClick={() => {
                            playSelect();
                            setIsPaused(true);
                        }}
                    >
                        ⏸ Pausar
                    </button>

                </aside>

                {/* Tablero interactivo de gemas. */}
                <div className="boardWrapper">
                    <div className="board">
                        {board.flat().map(gem=>(
                            <button
                                key={gem.id}
                                className={`gem ${
                                    selectedGem?.id === gem.id ? "selected" : ""
                                } ${
                                    matchedGemIds.includes(gem.id) ? "matched" : ""
                                }`}
                                aria-label={`Gema ${gem.color}`}
                                onClick={()=>handleGemClick(gem)}
                            >
                                <img
                                    src={gemImages[gem.color]}
                                    alt={`Gema ${gem.color}`}
                                    className="gemImage"
                                />
                            </button>
                        ))}
                    </div>
                </div>

            </section>

            {/* Modal de pausa de la partida. */}
            {isPaused && !gameResult && (
                <div className="pauseOverlay">
                    <div className="pauseModal">
                        <div className="pauseIcon">⏸</div>

                        <h2>Juego pausado</h2>

                        <p>
                            La partida está detenida. Puedes continuar jugando o volver al menú de niveles.
                        </p>

                        <div className="pauseActions">
                            <button onClick={() => {
                                playSelect();
                                setIsPaused(false);
                            }}>
                                ▶ Continuar
                            </button>

                            <button onClick={() => {
                                playSelect();
                                navigate("/levels");
                            }}>
                                🗺 Salir a niveles
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal final que aparece al ganar o perder. */}
            {gameResult && (
                <div className="resultOverlay">
                    <div className={`resultModal ${gameResult}`}>

                        {/* Icono visual del desenlace. */}
                        <div className="resultIcon">
                            {gameResult === "win" ? "🏆" : "💔"}
                        </div>

                        {/* Título principal del resultado. */}
                        <h2>
                            {gameResult === "win" ? "¡VICTORIA!" : "DERROTA"}
                        </h2>

                        {/* Mensaje contextual según el estado final. */}
                        <p className="resultMessage">
                            {gameResult === "win"
                                ? `Has superado el nivel ${currentLevel}.`
                                : "No alcanzaste el objetivo esta vez."}
                        </p>

                        {/* Puntuación total obtenida en la partida. */}
                        <div className="resultScore">
                            Puntaje final: <span>{score}</span>
                        </div>

                        {/* Desbloqueo del siguiente nivel si corresponde. */}
                        {gameResult === "win" && currentLevel < 3 && (
                            <p className="unlockMessage">
                                Nivel {currentLevel + 1} desbloqueado
                            </p>
                        )}

                        {/* Acciones disponibles al terminar la partida. */}
                        <div className="resultActions">
                            <button onClick={()=>window.location.reload()}>
                                ↻ Reintentar
                            </button>

                            <button onClick={()=>navigate("/levels")}>
                                🗺 Volver a niveles
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </main>
    );
}