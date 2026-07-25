import { apiFetch } from "../config/api";

export type Player = {
  id: number;
  nombre: string;
  email: string;
};

type AuthResponse = {
  token: string;
  jugador: Player;
};

const TOKEN_KEY = "gemquest_token";
const PLAYER_KEY = "gemquest_player";

/** Lee el JWT almacenado en localStorage. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Lee los datos del jugador activo desde localStorage. */
export function getPlayer(): Player | null {
  const stored = localStorage.getItem(PLAYER_KEY);
  return stored ? (JSON.parse(stored) as Player) : null;
}

/** Indica si existe una sesion iniciada en el cliente. */
export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

/** Persiste token y datos del jugador en localStorage. */
function saveSession(token: string, jugador: Player): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PLAYER_KEY, JSON.stringify(jugador));
}

/** Elimina la sesion local del jugador. */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PLAYER_KEY);
}

/** Registra un jugador en la API y guarda su sesion. */
export async function register(
  nombre: string,
  email: string,
  password: string
): Promise<Player> {
  const data = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ nombre, email, password })
  });

  saveSession(data.token, data.jugador);
  return data.jugador;
}

/** Autentica al jugador y guarda su sesion. */
export async function login(email: string, password: string): Promise<Player> {
  const data = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  saveSession(data.token, data.jugador);
  return data.jugador;
}

/** Solicita un enlace de recuperacion de contrasena por correo. */
export async function requestPasswordReset(
  email: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

/** Restablece la contrasena usando el token recibido por correo. */
export async function resetPassword(
  token: string,
  password: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password })
  });
}
