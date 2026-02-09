import { create } from "zustand";
import { api } from "@/lib/api";

type User = {
  id: number;
  email?: string;
  role?: string;
};

type MeResponse = {
  id: number;
  email: string;
  roles: string[];
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

    if (!token || token === "undefined" || token === "null" || token.split(".").length !== 3) {
      set({ user: null, token: null, loading: false });
      return;
    }

    api.setToken(token);
    set({ token, loading: true });

    api.get<MeResponse>("/auth/me")
      .then((me) => {
        set({
          user: { id: me.id, email: me.email, role: me.roles?.[0] ?? "" },
          loading: false,
        });
      })
      .catch(() => {
        localStorage.removeItem("token");
        api.clearToken();
        set({ user: null, token: null, loading: false });
      });
  },


  login: async (email: string, password: string) => {
    const result = await api.post<any>("/auth/login", { email, password });

    const token: string | undefined =
      result?.jwt ?? result?.token ?? result?.accessToken ?? result?.jwtToken;

    if (!token || token === "undefined" || token === "null" || token.split(".").length !== 3) {
      console.log("Login response data was:", result);
      throw new Error("Login succeeded but no valid JWT was returned.");
    }

    localStorage.setItem("token", token);

    api.setToken(token);

    const me = await api.get<MeResponse>("/auth/me");

    set({
      token,
      user: {
        id: me.id,
        email: me.email,
        role: me.roles?.[0] ?? "",
      },
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
      api.clearToken();
      set({ user: null, token: null, loading: false });
    }
  },
}));
