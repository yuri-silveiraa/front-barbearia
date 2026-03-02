import { api } from "../http";
import type { LoginResponse } from "./types";

export async function googleAuthService(credential: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/user/google", {
      credential,
    });
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Erro ao fazer login com Google";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}
