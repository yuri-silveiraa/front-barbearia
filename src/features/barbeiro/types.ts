export interface BarberAppointment {
  id: string;
  clientId?: string | null;
  customerId?: string;
  client: string;
  clientTelephone?: string;
  barberId: string;
  barber: string;
  serviceId: string;
  service: string;
  serviceNames?: string[];
  time: string;
  endTime?: string;
  serviceDurationMinutes?: number;
  serviceDurations?: number[];
  price?: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
}

export interface TimeSlot {
  id: string;
  date?: string;
  startAt: string;
  endAt: string;
  data?: string;
}
