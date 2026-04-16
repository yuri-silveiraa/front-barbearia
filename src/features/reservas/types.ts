// Reserva status type
export type ReservaStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";

export const statusMap: Record<ReservaStatus, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Atendida",
  CANCELED: "Cancelada",
};

// Reserva type
export interface Reserva {
  id: string;
  client: string;
  barber: string;
  barberTelephone?: string | null;
  service: string;
  serviceNames?: string[];
  time: string;
  endTime?: string;
  status: ReservaStatus;
  price?: number;
  duration?: number;
}
