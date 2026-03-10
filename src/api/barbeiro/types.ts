export interface BarberAppointment {
  id: string;
  clientId: string;
  client: string;
  barberId: string;
  barber: string;
  serviceId: string;
  service: string;
  time: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
}

export interface TimeSlot {
  id: string;
  date: string;
  disponible: boolean;
}
