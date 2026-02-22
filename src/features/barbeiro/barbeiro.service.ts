import { api } from "../../api/http";
import type { BarberAppointment } from "./types";

export async function getBarberTodayAppointments(): Promise<BarberAppointment[]> {
  const { data } = await api.get<BarberAppointment[]>("/barber/today-appointments");
  return data;
}

export async function attendAppointment(appointmentId: string): Promise<void> {
  await api.patch(`/appointment/attend/${appointmentId}`);
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await api.patch(`/appointment/cancel/${appointmentId}`);
}
