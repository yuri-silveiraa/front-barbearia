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
  service: string;
  time: string;
  status: ReservaStatus;
}
