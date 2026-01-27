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
    token: string;
    user: User;
};

export async function login(email: string, password: string): Promise<User> {
    const result = await api.post<LoginResponse>("/login", {
        email,
        password,
    });

    api.setToken(result.token);
    return result.user;
}

export async function logout(): Promise<void> {
    try {
        await api.post<null>("/auth/logout");
    } catch {
        // ignore backend failure, just clear token
    }
    api.clearToken();
}
