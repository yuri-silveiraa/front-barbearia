import { api } from "../http";
import type { Reserva } from "../../features/reservas/types";
import type { Barber, Service, TimeSlot, ReservaPayload } from "./types";

export async function getReservas(): Promise<Reserva[]> {
  const { data } = await api.get("/appointment/client-appointments");
  console.log(data);
  return data;
}

export async function criarReserva(payload: ReservaPayload): Promise<Reserva> {
  const { data } = await api.post("/appointment/create", payload);
  return data;
}

export async function getBarbers(): Promise<Barber[]> {
  const { data } = await api.get("/barber");
  return data;
}

export async function getServices(): Promise<Service[]> {
  const { data } = await api.get("/service");
  return data;
}

export async function getTimesByBarber(barberId: string): Promise<TimeSlot[]> {
  const { data } = await api.get(`/time/${barberId}`);
  return data;
}
