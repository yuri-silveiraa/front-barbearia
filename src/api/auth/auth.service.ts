import { api } from "../http";
import type { LoginData } from "./schema";
import type { LoginResponse } from "./types";
import type { User } from "../../features/auth/types";

export async function loginService(data: LoginData): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/user/login", data);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Credenciais inválidas";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getMe(): Promise<{ user: User }> {
  const response = await api.get<User>("/user/me");
  return { user: response.data };
}

export async function logoutService(): Promise<void> {
  await api.post("/user/logout");
}
