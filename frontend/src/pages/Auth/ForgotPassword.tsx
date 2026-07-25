import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import MenuField from "../../components/MenuPanel/MenuField";
import MenuPanel from "../../components/MenuPanel/MenuPanel";
import { requestPasswordReset } from "../../services/authService";
import "./Auth.css";

/** Solicita enlace de recuperacion de contrasena por correo. */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Envia el correo de recuperacion a la API. */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage">
      <MenuPanel className="authCard">
        <h1 className="menuPanelTitle">Recuperar contraseña</h1>
        <p className="menuPanelSubtitle">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

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

          {error && <p className="menuError">{error}</p>}
          {message && <p className="menuSuccess">{message}</p>}

          <button type="submit" className="menuGemBtn" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="menuFooter">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
        <button className="menuTextBtn" onClick={() => navigate("/")}>
          ← Volver al inicio
        </button>
      </MenuPanel>
    </main>
  );
}
