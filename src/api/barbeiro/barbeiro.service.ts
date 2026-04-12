import { api } from "../../api/http";
import type { BarberAppointment, BarberFinanceResponse, ManualAppointmentPayload, TimeSlot } from "./types";

export async function getBarberTodayAppointments(): Promise<BarberAppointment[]> {
  const { data } = await api.get<BarberAppointment[]>("/barber/today-appointments");
  return data;
}

export async function getBarberAppointmentsByRange(start: string, end: string): Promise<BarberAppointment[]> {
  const { data } = await api.get<BarberAppointment[]>(
    `/barber/appointments?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  );
  return data;
}

export async function getBarberFinanceByRange(start: string, end: string): Promise<BarberFinanceResponse> {
  const { data } = await api.get<BarberFinanceResponse>(
    `/barber/revenue?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  );
  return data;
}

export async function attendAppointment(appointmentId: string): Promise<void> {
  await api.patch(`/appointment/attend/${appointmentId}`);
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await api.patch(`/appointment/cancel/${appointmentId}`);
}

export async function getMyTimeSlots(): Promise<TimeSlot[]> {
  const { data } = await api.get<TimeSlot[]>("/time/my-times");
  return data;
}

export async function createManualAppointment(payload: ManualAppointmentPayload): Promise<BarberAppointment> {
  try {
    const { data } = await api.post<BarberAppointment>("/barber/appointments/manual", payload);
    return data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || "Erro ao criar agendamento");
    }
    throw new Error("Erro de conexão. Tente novamente.");
  }
}
