import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import MenuField from "../../components/MenuPanel/MenuField";
import MenuPanel from "../../components/MenuPanel/MenuPanel";
import { login } from "../../services/authService";
import "./Auth.css";

/** Formulario de inicio de sesion con validacion y redireccion al juego. */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Envía credenciales a la API y navega a seleccion de nivel. */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/levels");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage">
      <MenuPanel className="authCard">
        <h1 className="menuPanelTitle">Iniciar sesión</h1>
        <p className="menuPanelSubtitle">Accede para guardar tu progreso en la nube.</p>

        <form className="menuForm" onSubmit={handleSubmit}>
          <MenuField label="Usuario" icon="blue">
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </MenuField>

          <MenuField label="Contraseña" icon="red">
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </MenuField>

          {error && <p className="menuError">{error}</p>}

          <button type="submit" className="menuGemBtn" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="menuFooter">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </p>

        <p className="menuFooter">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
        <button className="menuTextBtn" onClick={() => navigate("/")}>
          ← Volver al inicio
        </button>
      </MenuPanel>
    </main>
  );
}
