import { api } from "../http";
import { type LoginData } from "../../features/auth/types";

export async function loginService(data: LoginData) {
  const response = await api.post("/auth/login", data);
  return response.data; // deve retornar { token, user }
}
