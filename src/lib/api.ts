const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;
let onUnauthorized: () => void = () => {};

export const setAccessToken = (t: string | null) => (accessToken = t);
export const setOnUnauthorized = (fn: () => void) => (onUnauthorized = fn);

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/** Exchange the httpOnly refresh cookie for a new access token (deduplicated). */
export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (r) => {
      if (!r.ok) return false;
      const data = await r.json();
      setAccessToken(data.accessToken);
      return true;
    })
    .catch(() => false)
    .finally(() => (refreshing = null));
  return refreshing;
}

export async function api<T = unknown>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "include" });

  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    if (await refreshSession()) return api<T>(path, init, false);
    onUnauthorized();
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? res.statusText, data.details);
  return data as T;
}

export const http = {
  get: <T>(p: string) => api<T>(p),
  post: <T>(p: string, body?: unknown) => api<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T>(p: string, body: unknown) => api<T>(p, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(p: string, body: unknown) => api<T>(p, { method: "PATCH", body: JSON.stringify(body) }),
  del: (p: string) => api<void>(p, { method: "DELETE" }),
};
