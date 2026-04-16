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
  time: string;
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

export interface ManualAppointmentPayload {
  customerName: string;
  customerWhatsapp: string;
  serviceId: string;
  startAt: string;
}

export interface BarberRevenueAppointment {
  id: string;
  serviceId: string;
  service: string;
  amount: number;
  completedAt: string;
}

export interface BarberFinanceResponse {
  totalRevenue: number;
  appointments: BarberRevenueAppointment[];
  services?: Array<{
    serviceId: string;
    service: string;
    count: number;
    total: number;
  }>;
}
