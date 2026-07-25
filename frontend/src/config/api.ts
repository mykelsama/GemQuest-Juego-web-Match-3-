export const API_URL = import.meta.env.VITE_API_URL ?? "";

/** Realiza peticiones HTTP al backend con JSON y token JWT opcional. */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("gemquest_token");
  const baseUrl = API_URL.replace(/\/$/, "");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {})
  };

  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error ?? "Error en la solicitud.");
  }

  return response.json() as Promise<T>;
}
