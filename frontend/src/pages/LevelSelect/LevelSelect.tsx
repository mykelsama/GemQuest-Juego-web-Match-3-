import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGem, FaLock, FaStar } from "react-icons/fa";

import { levelsConfig } from "../../game/config/levels";
import { getLevelBackground } from "../../assets/images/levelBackgrounds";
import { getProgress } from "../../services/progressService";

import "./LevelSelect.css";

/** Pantalla de seleccion de niveles con estado de desbloqueo y mejores puntajes. */
export default function LevelSelect(){

    /* Navegación hacia otras pantallas del juego. */
    const navigate = useNavigate();

    /* Estado local de todos los niveles con progreso aplicado. */
    const [levels, setLevels] = useState(
        levelsConfig.map(level => ({
            ...level,
            bestScore: 0,
            unlocked: level.id === 1
        }))
    );

    /* Carga el progreso guardado para actualizar desbloqueos y puntajes. */
    useEffect(() => {
        getProgress().then(progress => {
            setLevels(
                levelsConfig.map(level => ({
                    ...level,
                    bestScore: progress.bestScores[level.id] ?? 0,
                    unlocked: level.id <= progress.unlockedLevel
                }))
            );
        });
    }, []);

    /** Navega a la partida del nivel seleccionado. */
    const startLevel = (levelId:number) => {
        navigate(`/game?level=${levelId}`);
    };

    return(
        <main className="levelPage">

            {/* Encabezado con acceso para volver al inicio. */}
            <header className="levelHeader">
                <button
                    className="backButton"
                    onClick={()=>navigate("/")}
                >
                    ← Volver
                </button>

                <h1>Selecciona tu nivel</h1>
            </header>

            {/* Lista visual de niveles disponibles y bloqueados. */}
            <section className="levelGrid">
                {levels.map(level=>(
                    <article
                        key={level.id}
                        className={`levelCard ${!level.unlocked ? "locked" : ""}`}
                        style={{ backgroundImage: `url(${getLevelBackground(level.id)})` }}
                    >
                        <div className="levelBadge">
                            {level.unlocked ? <FaGem/> : <FaLock/>}
                        </div>

                        <div className="levelNumber">
                            Nivel {level.id}
                        </div>

                        <h2>{level.title}</h2>

                        <p className={`levelStatus ${level.unlocked ? "available" : "blocked"}`}>
                            {level.unlocked ? "Disponible" : "Bloqueado"}
                        </p>

                        <p className="levelInfo">
                            Objetivo: {level.objective}<br/>
                            Movimientos: {level.moves}<br/>
                            Mejor puntaje:{" "}
                            <span className="bestScore">
                                <FaStar/> {level.bestScore}
                            </span>
                        </p>

                        <button
                            className="playLevel"
                            disabled={!level.unlocked}
                            onClick={()=>startLevel(level.id)}
                        >
                            {level.unlocked ? "Jugar nivel" : "Bloqueado"}
                        </button>
                    </article>
                ))}
            </section>

        </main>
    );
}
