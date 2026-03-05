// src/lib/api.ts
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "/api";

export type ApiResponse<T> = {
    message: string;
    data: T;
};

let authToken: string | null = localStorage.getItem("token");

function setToken(token: string) {
    authToken = token;
    localStorage.setItem("token", token);
}

function clearToken() {
    authToken = null;
    localStorage.removeItem("token");
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const isJwt = token && token !== "undefined" && token !== "null" && token.split(".").length === 3;

  const isAuthLogin = path === "/auth/login"; 

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(!isAuthLogin && isJwt ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

    if (!res.ok) {
      const text = await res.text().catch(() => "");

      // Try to parse backend ApiResponse { message, data }
      try {
        const parsed = JSON.parse(text);
        const msg =
          parsed?.data ||
          parsed?.message ||
          parsed?.error ||
          `Request failed (${res.status})`;
        throw new Error(typeof msg === "string" ? msg : `Request failed (${res.status})`);
      } catch {
        throw new Error(text || `Request failed (${res.status})`);
      }
    }

    const json = (await res.json()) as ApiResponse<T>;
    return json.data;
}

const api = {
    setToken,
    clearToken,

    get: <T>(path: string) => apiRequest<T>(path),
    post: <T>(path: string, body?: unknown) =>
        apiRequest<T>(path, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),
    put: <T>(path: string, body?: unknown) =>
        apiRequest<T>(path, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        }),
    del: <T>(path: string) =>
        apiRequest<T>(path, {
            method: "DELETE",
        }),
};

export default api;
export { api };
