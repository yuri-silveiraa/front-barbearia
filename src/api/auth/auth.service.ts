import { api } from "../http";
import { type LoginData } from "../../features/auth/types";

export async function loginService(data: LoginData) {
  const response = await api.post("/user/login", data);
  if (response.status === 401){
    alert(response.data.message);
  }
  console.log(response.data.data);
  return response.data;
}
