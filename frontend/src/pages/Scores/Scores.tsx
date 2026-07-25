import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { isAuthenticated, getPlayer } from "../../services/authService";
import {
  formatDate,
  formatDuration,
  getGlobalScores,
  getScores,
  type GlobalScoreRecord,
  type ScoreRecord
} from "../../services/scoresService";

import "./Scores.css";

/** Tabla de puntajes personales con historial de partidas. */
function PersonalScoresTable({
  title,
  records,
  emptyMessage
}: {
  title: string;
  records: ScoreRecord[];
  emptyMessage: string;
}) {
  return (
    <section className="scoresSection">
      <h2>{title}</h2>

      {records.length === 0 ? (
        <p className="scoresEmpty">{emptyMessage}</p>
      ) : (
        <div className="scoresTableWrapper">
          <table className="scoresTable">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Puntaje</th>
                <th>Fecha</th>
                <th>Tiempo de nivel</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>
                    <span className="levelTag">Nivel {record.nivel}</span>
                    <small>{record.nivelTitulo}</small>
                  </td>
                  <td className="scoreValue">{record.puntaje}</td>
                  <td>{formatDate(record.fecha)}</td>
                  <td>{formatDuration(record.tiempoNivelSegundos)}</td>
                  <td>
                    <span className={`resultTag ${record.resultado}`}>
                      {record.resultado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Tabla de ranking global con nombre de jugador por nivel. */
function GlobalScoresTable({
  title,
  records,
  emptyMessage,
  currentPlayerName
}: {
  title: string;
  records: GlobalScoreRecord[];
  emptyMessage: string;
  currentPlayerName?: string;
}) {
  return (
    <section className="scoresSection scoresSection--global">
      <h2>{title}</h2>

      {records.length === 0 ? (
        <p className="scoresEmpty">{emptyMessage}</p>
      ) : (
        <div className="scoresTableWrapper">
          <table className="scoresTable">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Jugador</th>
                <th>Puntaje</th>
                <th>Fecha</th>
                <th>Tiempo de nivel</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr
                  key={`${record.nivel}-${record.jugadorNombre}-${record.id}`}
                  className={
                    currentPlayerName &&
                    record.jugadorNombre === currentPlayerName
                      ? "scoresRow--me"
                      : undefined
                  }
                >
                  <td>
                    <span className="levelTag">Nivel {record.nivel}</span>
                    <small>{record.nivelTitulo}</small>
                  </td>
                  <td className="playerName">{record.jugadorNombre}</td>
                  <td className="scoreValue">{record.puntaje}</td>
                  <td>{formatDate(record.fecha)}</td>
                  <td>{formatDuration(record.tiempoNivelSegundos)}</td>
                  <td>
                    <span className={`resultTag ${record.resultado}`}>
                      {record.resultado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Pantalla de puntajes globales, records personales e historial. */
export default function Scores() {
  const navigate = useNavigate();
  const player = getPlayer();
  const [globalBestScores, setGlobalBestScores] = useState<GlobalScoreRecord[]>([]);
  const [personalBestScores, setPersonalBestScores] = useState<ScoreRecord[]>([]);
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    Promise.all([
      getGlobalScores().catch(() => {
        setGlobalError("No se pudieron cargar los puntajes globales. Verifica que el backend esté en ejecución.");
        return { bestScores: [] };
      }),
      getScores()
    ])
      .then(([globalData, personalData]) => {
        setGlobalBestScores(globalData.bestScores);
        setPersonalBestScores(personalData.bestScores);
        setHistory(personalData.history);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="scoresPage">
      <header className="scoresHeader">
        <button className="backButton" onClick={() => navigate("/")}>
          ← Volver
        </button>
        <h1>Mejores puntajes</h1>
      </header>

      {!isAuthenticated() && (
        <p className="scoresNotice">
          Inicia sesión para sincronizar tus puntajes personales en la base de datos.
        </p>
      )}

      {loading ? (
        <p className="scoresEmpty">Cargando puntajes...</p>
      ) : (
        <>
          {globalError && <p className="scoresNotice">{globalError}</p>}

          <GlobalScoresTable
            title="Ranking global por nivel"
            records={globalBestScores}
            emptyMessage="Aún no hay puntajes globales registrados."
            currentPlayerName={player?.nombre}
          />

          <PersonalScoresTable
            title="Mis récords por nivel"
            records={personalBestScores}
            emptyMessage="Aún no tienes récords. Juega un nivel para registrar tu primer puntaje."
          />

          <PersonalScoresTable
            title="Mi historial de partidas"
            records={history}
            emptyMessage="No hay partidas registradas todavía."
          />
        </>
      )}
    </main>
  );
}
