import "./Home.css";
import { useNavigate } from "react-router-dom";
import {
    FaPlay,
    FaGem,
    FaTrophy,
    FaSignInAlt,
    FaUserPlus,
    FaSignOutAlt
} from "react-icons/fa";

import MenuPanel from "../../components/MenuPanel/MenuPanel";
import { getPlayer, isAuthenticated, logout } from "../../services/authService";

/** Pantalla de inicio con menu de navegacion y acceso a sesion. */
export default function Home(){

    const navigate = useNavigate();
    const player = getPlayer();
    const loggedIn = isAuthenticated();

    /** Cierra sesion y recarga la pantalla de inicio. */
    const handleLogout = () => {
        logout();
        navigate("/");
        window.location.reload();
    };

    return(

        <div className="home">

            <MenuPanel className="homeContainer">

                <div className="logo">
                    💎
                </div>

                <h1 className="title">
                    GEMQUEST
                </h1>

                <p className="subtitle">
                    Combina gemas, supera desafíos y conquista todos los niveles.
                </p>

                {loggedIn && player && (
                    <p className="subtitle">
                        Jugador: <strong>{player.nombre}</strong>
                    </p>
                )}

                <div className="menuActions">

                    <button
                        className="menuGemBtn"
                        onClick={() => navigate("/levels")}
                    >
                        <FaPlay />
                        <span>Jugar</span>
                    </button>

                    <button
                        className="menuPillBtn"
                        onClick={() => navigate("/levels")}
                    >
                        <FaGem />
                        <span>Seleccionar nivel</span>
                    </button>

                    {!loggedIn ? (
                        <>
                            <button
                                className="menuPillBtn"
                                onClick={() => navigate("/login")}
                            >
                                <FaSignInAlt />
                                <span>Iniciar sesión</span>
                            </button>

                            <button
                                className="menuPillBtn"
                                onClick={() => navigate("/register")}
                            >
                                <FaUserPlus />
                                <span>Crear cuenta</span>
                            </button>
                        </>
                    ) : (
                        <button
                            className="menuPillBtn"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt />
                            <span>Cerrar sesión</span>
                        </button>
                    )}

                    <button
                        className="menuPillBtn"
                        onClick={() => navigate("/scores")}
                    >
                        <FaTrophy />
                        <span>Mejores puntajes</span>
                    </button>

                </div>

            </MenuPanel>

        </div>

    );

}
