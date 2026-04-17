import type { Reserva } from "../../features/reservas/types";

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImageUrl?: string | null;
  specialties?: string[];
  available?: boolean;
}

export interface Service {
  id: string;
  barberId?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  imagemUrl?: string | null;
}

export interface TimeSlot {
  id: string;
  data: string;
  date?: string;
  startAt?: string;
  endAt?: string;
}

export interface ReservaPayload {
  clientId: string;
  barberId: string;
  serviceIds: string[];
  startAt: string;
}

export interface PaginatedReservas {
  data: Reserva[];
  total: number;
  page: number;
  totalPages: number;
}
