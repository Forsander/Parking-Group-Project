import { create } from "zustand";
import { api } from "@/lib/api";

type User = {
  id: number;
  email?: string;
  role?: string;
};

type LoginResponse = {
  id: number;
  jwt: string;
};

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  checkAuth: () => {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined") {
      set({ user: null, token: null, loading: false });
      return;
    }

    set({
      token,
      loading: false,
      // You don't have user info from backend yet, so keep it minimal
      user: null,
    });
  },

login: async (email: string, password: string) => {
    const result = await api.post<any>("/auth/login", { email, password });

    // Support common backend field names just in case:
    const token: string | undefined =
    result?.jwt ?? result?.token ?? result?.accessToken ?? result?.jwtToken;

    // Validate token looks like a JWT (header.payload.signature)
    if (!token || token === "undefined" || token === "null" || token.split(".").length !== 3) {
    console.log("Login response data was:", result);
    throw new Error("Login succeeded but no valid JWT was returned (check login response fields).");
    }

    localStorage.setItem("token", token);

    set({
    token,
    user: result?.id ? { id: Number(result.id) } : null,
    loading: false,
    });
},

  signup: async (email: string, password: string) => {
    await api.post<User>("/users/create", { email, password });
  },

  logout: async () => {
    try {
      await api.post<void>("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },
}));
