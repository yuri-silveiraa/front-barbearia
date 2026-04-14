import { api } from "../http";
import type { LoginData, RegisterData } from "./schema";
import type { LoginResponse } from "./types";
import type { UpdateProfileData, User } from "../../features/auth/types";
import { fileToBase64, resolveApiImageUrl } from "../../utils/apiImage";

type ApiUser = {
  id: string;
  name: string;
  email: string;
  type?: "BARBER" | "CLIENT";
  telephone?: string;
  phone?: string;
  barber?: { isAdmin?: boolean };
  isAdmin?: boolean;
  profileImageUrl?: string | null;
};

function mapUser(data: ApiUser): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    type: data.type,
    phone: data.telephone ?? data.phone,
    profileImageUrl: resolveApiImageUrl(data.profileImageUrl),
    isAdmin: data.isAdmin ?? data.barber?.isAdmin ?? false,
  };
}

export async function loginService(data: LoginData): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/user/login", data);
    return { user: mapUser(response.data.user as ApiUser) };
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Credenciais inválidas";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function registerService(data: RegisterData): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>("/user/create", {
      name: data.name,
      email: data.email,
      password: data.password,
      telephone: data.telephone,
    });
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Erro ao criar conta";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function getMe(): Promise<{ user: User }> {
  const response = await api.get<ApiUser>("/user/me");
  return { user: mapUser(response.data) };
}

export async function logoutService(): Promise<void> {
  await api.post("/user/logout");
}

export async function verifyEmail(code: string): Promise<{ message: string; user: User }> {
  try {
    const response = await api.post<{ message: string; user: ApiUser }>("/user/verify-email", { code });
    return { message: response.data.message, user: mapUser(response.data.user) };
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Código inválido";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function resendVerificationCode(email: string): Promise<{ message: string }> {
  try {
    const response = await api.post<{ message: string }>("/user/resend-code", { email });
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Erro ao reenviar código";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function updateMe(data: UpdateProfileData): Promise<{ user: User }> {
  try {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.telephone !== undefined) payload.telephone = data.telephone;
    if (data.profileImageFile) {
      payload.profileImageBase64 = await fileToBase64(data.profileImageFile);
      payload.profileImageMimeType = data.profileImageFile.type;
    }
    if (data.removeProfileImage !== undefined) {
      payload.removeProfileImage = data.removeProfileImage;
    }

    const response = await api.patch<{ user: ApiUser }>("/user/me", payload);
    return { user: mapUser(response.data.user) };
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Erro ao atualizar perfil";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}

export async function deleteMe(): Promise<void> {
  try {
    await api.delete("/user/me");
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || "Erro ao excluir conta";
      throw new Error(message);
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}
