import { increment, decrement } from "./loading-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5299";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wbt_token");
}

interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: { id: string; name: string; email: string; roles: string[]; permissions: string[] };
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("wbt_refresh");
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;

      const data: RefreshResponse = await res.json();
      localStorage.setItem("wbt_token", data.accessToken);
      localStorage.setItem("wbt_refresh", data.refreshToken);
      localStorage.setItem("wbt_email", data.user.email);
      localStorage.setItem("wbt_name", data.user.name);
      localStorage.setItem("wbt_roles", JSON.stringify(data.user.roles));
      localStorage.setItem("wbt_perms", JSON.stringify(data.user.permissions));
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
  isRetry = false
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  const isFormData = rest.body instanceof FormData;
  if (!isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (!isRetry) increment();
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
    });

    // Access token expired — try one silent refresh, then retry the request
    if (res.status === 401 && auth && !isRetry && !path.startsWith("/api/auth/")) {
      if (await tryRefresh()) {
        return await request<T>(path, options, true);
      }
      localStorage.removeItem("wbt_token");
      localStorage.removeItem("wbt_refresh");
      if (typeof window !== "undefined") window.location.href = "/login";
    }

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    const data = text ? JSON.parse(text) : undefined;

    if (!res.ok) {
      const message = data?.message ?? res.statusText;
      throw new ApiError(res.status, message);
    }

    if (rest.method && rest.method !== "GET") {
      fetch("/api/revalidate-proxy", { method: "POST" }).catch(() => {});
    }

    return data as T;
  } finally {
    if (!isRetry) decrement();
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { API_URL };
