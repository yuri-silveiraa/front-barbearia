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
  date: string;
  data?: string;
  disponible?: boolean;
}

export interface ManualAppointmentPayload {
  customerName: string;
  customerWhatsapp: string;
  serviceId: string;
  timeId: string;
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
