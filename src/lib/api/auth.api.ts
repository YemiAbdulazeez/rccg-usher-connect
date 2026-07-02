import type { AuthUser } from "../types";
import { api } from "./client";

type AuthResponse = { user: AuthUser };

export const authApi = {
  me: () => api.get<AuthResponse>("/auth/me"),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => api.post<AuthResponse>("/auth/register", input),
  logout: () => api.post<{ ok: boolean }>("/auth/logout"),
  forgot: (email: string) => api.post<{ ok: boolean; message: string }>("/auth/forgot", { email }),
  reset: (token: string, password: string, confirmPassword: string) =>
    api.post<{ ok: boolean; message: string }>("/auth/reset", { token, password, confirmPassword }),
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    api.post<{ ok: boolean; message: string }>("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    }),
};
