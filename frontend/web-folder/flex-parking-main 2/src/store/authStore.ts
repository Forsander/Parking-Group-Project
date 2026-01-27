import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
    id: string;
    email: string;
    role: string;
}

interface LoginResult {
    token: string;
    user: User;
}

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

    // Load from localStorage on app start
    checkAuth: () => {
        const token = localStorage.getItem("jwt_token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr || userStr === "undefined") {
            set({ user: null, token: null, loading: false });
            return;
          }

          try {
            const user = JSON.parse(userStr);
            set({ user, token, loading: false });
          } catch (e) {
            // corrupted localStorage (or old format) -> wipe and continue logged out
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("user");
            set({ user: null, token: null, loading: false });
          }
    },

    // POST /api/v1/auth/login, body { email, password }
    // api.post<LoginResult> returns { token, user }
    login: async (email: string, password: string) => {
        const { token, user } = await api.post<LoginResult>("/auth/login", {
            email,
            password,
        });

        localStorage.setItem("jwt_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, token });
    },

    // POST /api/v1/users/create, body { email, password }
    signup: async (email: string, password: string) => {
        await api.post<User>("/users/create", { email, password });
        // you could auto-login here if you want:
        // const { token, user } = await api.post<LoginResult>("/auth/login", { email, password });
        // localStorage.setItem("jwt_token", token);
        // localStorage.setItem("user", JSON.stringify(user));
        // set({ user, token });
    },

    // POST /api/v1/auth/logout, then clear storage
    logout: async () => {
        await api.post<void>("/auth/logout");
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        set({ user: null, token: null });
    },
}));
