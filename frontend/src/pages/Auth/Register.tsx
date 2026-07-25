import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import MenuField from "../../components/MenuPanel/MenuField";
import MenuPanel from "../../components/MenuPanel/MenuPanel";
import { register } from "../../services/authService";
import "./Auth.css";

/** Formulario de registro de nueva cuenta de jugador. */
export default function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Registra al jugador y redirige a seleccion de nivel. */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(nombre, email, password);
      navigate("/levels");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage">
      <MenuPanel className="authCard">
        <h1 className="menuPanelTitle">Crear cuenta</h1>
        <p className="menuPanelSubtitle">Regístrate para guardar niveles y mejores puntajes.</p>

        <form className="menuForm" onSubmit={handleSubmit}>
          <MenuField label="Nombre" icon="green">
            <input
              type="text"
              value={nombre}
              onChange={event => setNombre(event.target.value)}
              placeholder="Tu nombre"
              required
            />
          </MenuField>

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
              minLength={6}
              required
            />
          </MenuField>

          {error && <p className="menuError">{error}</p>}

          <button type="submit" className="menuGemBtn" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="menuFooter">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
        <button className="menuTextBtn" onClick={() => navigate("/")}>
          ← Volver al inicio
        </button>
      </MenuPanel>
    </main>
  );
}
