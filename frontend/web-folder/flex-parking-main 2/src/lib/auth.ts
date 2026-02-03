// src/lib/auth.ts
import { api } from "./api";

export type Role = "ROLE_USER" | "ROLE_ADMIN";

export type User = {
    id: number;
    email: string;
    role: Role;
    // add more if backend returns them
};

type LoginResponse = {
    id: number;
    jwt: string;
};

export async function login(email: string, password: string) {
    const result = await api.post<LoginResponse>("/auth/login", { email, password });
    api.setToken(result.jwt);
    return result;
}

export async function logout(): Promise<void> {
    try {
        await api.post<null>("/auth/logout");
    } catch {
        // ignore backend failure, just clear token
    }
    api.clearToken();
}
