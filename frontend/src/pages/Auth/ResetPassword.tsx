import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import MenuField from "../../components/MenuPanel/MenuField";
import MenuPanel from "../../components/MenuPanel/MenuPanel";
import { resetPassword } from "../../services/authService";
import "./Auth.css";

/** Permite definir nueva contrasena usando el token de la URL. */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Valida token y contrasenas, luego actualiza la cuenta en la API. */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!tokenFromUrl) {
      setError("El enlace de recuperación no es válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(tokenFromUrl, password);
      setMessage(result.message);

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage">
      <MenuPanel className="authCard">
        <h1 className="menuPanelTitle">Nueva contraseña</h1>
        <p className="menuPanelSubtitle">Crea una nueva contraseña para tu cuenta.</p>

        <form className="menuForm" onSubmit={handleSubmit}>
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

          <MenuField label="Confirmar" icon="purple">
            <input
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </MenuField>

          {error && <p className="menuError">{error}</p>}
          {message && <p className="menuSuccess">{message}</p>}

          <button type="submit" className="menuGemBtn" disabled={loading || !tokenFromUrl}>
            {loading ? "Guardando..." : "Restablecer contraseña"}
          </button>
        </form>

        <p className="menuFooter">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </MenuPanel>
    </main>
  );
}
