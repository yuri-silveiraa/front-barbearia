import { api } from "../http";

export interface Reserva {
  id: string;
  client: string;
  barber: string;
  service: string;
  time: string;
  status:  "SCHEDULED" | "COMPLETED" | "CANCELED";
}

export async function getReservas(): Promise<Reserva[]> {
  const { data } = await api.get("/appointment/client-appointments");
  console.log(data);
  return data;
}

export async function criarReserva(payload: {
  clientId: string;
  barberId: string;
  serviceId: string;
  timeId: Date;
}): Promise<Reserva> {
  const { data } = await api.post("/appointment/create", payload);
  return data;
}

export async function getBarbers(): Promise<any[]> {
  const { data } = await api.get("/barber");
  return data;
}

export async function getServices(): Promise<any[]> {
  const { data } = await api.get("/service");
  return data;
}

export async function getTimesByBarber(barberId: string): Promise<any[]> {
  const { data } = await api.get(`/time/${barberId}`);
  return data;
}
