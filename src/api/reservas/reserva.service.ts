import { api } from "../http";

export const reservaService = {
  async createReserva(data: any) {
    const response = await api.post("/reservas", data);
    return response.data;
  }, 

}